<template>
  <IssuesPage
    v-if="pageState.type === 'ready'"
    :filter-value="filterValue"
    :filtering="filtering"
    :loading-move-boards="loadingMoveBoards"
    :loading-move-spaces="loadingMoveSpaces"
    :loading-move-statuses="loadingMoveStatuses"
    :move-boards="moveBoards"
    :move-error="moveError"
    :move-spaces="moveSpaces"
    :move-statuses="moveStatuses"
    :moving="moving"
    :page="request.page"
    :search="request.search"
    :view-model="pageState.data.IssuesPage"
    @change-move-board="changeMoveBoard"
    @change-move-space="changeMoveSpace"
    @load-move-boards="loadMoveBoards"
    @load-move-spaces="loadMoveSpaces"
    @load-move-statuses="loadMoveStatuses"
    @move-issues="moveIssues"
    @update-filters="updateFilters"
    @update-page="updatePage"
    @update-search="updateSearch" />
  <PageLoadState
    v-else
    :error-text="pageState.type === 'error' ? pageState.message : ''"
    :loading="pageState.type === 'pending'"
    loading-text="Loading issues…"
    @retry="refresh()" />
</template>

<script setup lang="ts">
import { debounce } from 'es-toolkit'

import {
  getIssueAttributeFilterInput,
  normalizeIssueAttributeFilters,
  readIssueAttributeQuery,
  readIssueSpaceQuery,
  withIssueAttributeFilters,
} from '../../../utils/issueAttributeFilters'
import type { IssuesPageApplicationDeps } from './IssuesPageApplicationDeps'
import type { IssuesPageFilterValue } from './view/IssuesPage.vue'
import IssuesPage from './view/IssuesPage.vue'

const props = defineProps<{ deps: IssuesPageApplicationDeps }>()
useHead({ title: 'All issues' })

// Page loading and filtering
const route = useRoute('organizations-organizationKey-issues')
const request = computed(() => ({
  attributeQuery: readIssueAttributeQuery(route.query),
  page: Math.max(1, Number(route.query.page) || 1),
  search: typeof route.query.search === 'string' ? route.query.search : '',
  spaceIds: readIssueSpaceQuery(route.query.space),
}))
const router = useRouter()
const {
  actionResult: outcome,
  refresh,
  state: pageState,
} = await useActionData({
  action: () => props.deps.viewIssuesPage(request.value),
  fallbackMessage: 'Could not load issues. Try again.',
  key: asyncDataKeys.workspace.issues,
  messages: {
    AccessDenied: 'You do not have access to organization issues.',
    TemporarilyUnavailable:
      'Could not load issues. The service is temporarily unavailable.',
  },
})
const issueAttributes = computed(() =>
  pageState.value.type === 'ready'
    ? pageState.value.data.IssuesPage.attributes
    : [],
)
const attributeFilters = computed(() =>
  normalizeIssueAttributeFilters(
    request.value.attributeQuery,
    issueAttributes.value,
  ),
)
const filterValue = computed<IssuesPageFilterValue>(() => ({
  attributes: attributeFilters.value,
  spaceIds: request.value.spaceIds,
}))

function updateFilters(value: IssuesPageFilterValue) {
  const query = withIssueAttributeFilters(
    route.query,
    value.attributes,
    issueAttributes.value,
  )
  if (value.spaceIds.length) {
    query.space = value.spaceIds
  } else {
    delete query.space
  }
  void router.replace({ query })
}

function updatePage(value: number) {
  const query = { ...route.query }
  if (value > 1) {
    query.page = String(value)
  } else {
    delete query.page
  }
  void router.replace({ query })
}

function updateSearch(value: string) {
  const query = { ...route.query }
  delete query.page
  if (value) {
    query.search = value
  } else {
    delete query.search
  }
  void router.replace({ query })
}

// Move dialog state
const loadingMoveSpaces = ref(false)
const loadingMoveBoards = ref(false)
const loadingMoveStatuses = ref(false)
const moveSpaces = ref<Array<{ label: string; value: string }>>([])
const moveBoards = ref<Array<{ label: string; value: string }>>([])
const moveStatuses = ref<Array<{ id: string; name: string }>>([])
const moveError = ref<null | string>(null)
const moving = ref(false)

// Lazy move destination loading
async function loadMoveSpaces() {
  moveError.value = null
  loadingMoveSpaces.value = true
  const result = await props.deps.loadIssuesMoveSpaces()
  loadingMoveSpaces.value = false
  matchActionResult({
    err: (error) => {
      moveError.value = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have access to available boards.',
          TemporarilyUnavailable: 'Could not load available boards.',
        },
      })
    },
    ok: (value) => {
      moveSpaces.value = value.spaces
    },
    result,
  })
}

function changeMoveSpace() {
  loadingMoveBoards.value = false
  loadingMoveStatuses.value = false
  moveError.value = null
  moveBoards.value = []
  moveStatuses.value = []
}

async function loadMoveBoards(spaceId: string) {
  moveError.value = null
  loadingMoveBoards.value = true
  const result = await props.deps.loadIssuesMoveBoards({ spaceId })
  loadingMoveBoards.value = false
  matchActionResult({
    err: (error) => {
      moveError.value = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have access to this space.',
          SpaceNotFound: 'This space no longer exists.',
          TemporarilyUnavailable: 'Could not load space boards.',
        },
      })
    },
    ok: (value) => {
      moveBoards.value = value.boards
    },
    result,
  })
}

function changeMoveBoard() {
  loadingMoveStatuses.value = false
  moveStatuses.value = []
  moveError.value = null
}

async function loadMoveStatuses(boardId: string) {
  moveError.value = null
  moveStatuses.value = []
  loadingMoveStatuses.value = true
  const result = await props.deps.loadIssuesMoveStatuses({ boardId })
  loadingMoveStatuses.value = false
  matchActionResult({
    err: (error) => {
      moveError.value = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have access to this board.',
          BoardNotFound: 'This board no longer exists.',
          TemporarilyUnavailable: 'Could not load board columns.',
        },
      })
    },
    ok: (value) => {
      moveStatuses.value = value.statuses
    },
    result,
  })
}

// Move submission
const invalidation = useAsyncDataInvalidation()

async function moveIssues(input: { issueKeys: string[]; statusId: string }) {
  moveError.value = null
  moving.value = true
  const result = await props.deps.moveIssues(input)
  matchActionResult({
    err: (error) => {
      moveError.value = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have permission to move some issues.',
          InvalidStatus: 'Select a valid board column.',
          ResourceNotFound: 'An issue or board column was not found.',
          TemporarilyUnavailable: 'Could not move some issues. Try again.',
        },
      })
    },
    ok: () => undefined,
    result,
  })
  invalidation.invalidateIssuesDataExceptIssuesPage(input.issueKeys)
  await searchIssues(request.value)
  moving.value = false
}

// Issue search
const runSearch = createLatestRequest()
const filtering = ref(false)

async function searchIssues(input: typeof request.value) {
  scheduleSearch.cancel()
  filtering.value = true
  const latest = await runSearch({
    onLatest: (result) => {
      matchActionResult({
        err: (error) => {
          outcome.value = { error, ok: false }
        },
        ok: (value) => {
          const current = outcome.value
          if (!current) {
            return
          }
          matchActionResult({
            err: () => undefined,
            ok: (currentValue) => {
              outcome.value = {
                ok: true,
                value: {
                  IssuesPage: {
                    ...currentValue.IssuesPage,
                    ...value.IssuesPage,
                  },
                },
              }
            },
            result: current,
          })
        },
        result,
      })
    },
    request: () =>
      props.deps.searchIssues({
        filters: getIssueAttributeFilterInput(
          attributeFilters.value,
          issueAttributes.value,
        ),
        page: input.page,
        search: input.search,
        spaceIds: input.spaceIds,
      }),
  })
  if (latest) {
    filtering.value = false
  }
}

const scheduleSearch = debounce(searchIssues, 300)
watch(request, (input) => {
  filtering.value = true
  scheduleSearch(input)
})
onScopeDispose(scheduleSearch.cancel)
</script>
