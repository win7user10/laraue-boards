<template>
  <BacklogPage
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
    :view-model="pageState.data.BacklogPage"
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
    loading-text="Loading backlog…"
    @retry="refresh()" />
</template>

<script setup lang="ts">
import { debounce } from 'es-toolkit'

import {
  getIssueAttributeFilterInput,
  normalizeIssueAttributeFilters,
  readIssueAttributeQuery,
  withIssueAttributeFilters,
} from '../../../utils/issueAttributeFilters'
import type { BacklogPageApplicationDeps } from './BacklogPageApplicationDeps'
import type { BacklogPageFilterValue } from './view/BacklogPage.vue'
import BacklogPage from './view/BacklogPage.vue'

const props = defineProps<{
  deps: BacklogPageApplicationDeps
  spaceKey: string
}>()
const route = useRoute('organizations-organizationKey-spaces-spaceKey-backlog')
const request = computed(() => ({
  attributeQuery: readIssueAttributeQuery(route.query),
  page: Math.max(1, Number(route.query.page) || 1),
  search: typeof route.query.search === 'string' ? route.query.search : '',
  spaceKey: props.spaceKey,
}))
const router = useRouter()
const {
  actionResult: outcome,
  refresh,
  state: pageState,
} = await useActionData({
  action: () => props.deps.viewBacklogPage(request.value),
  fallbackMessage: 'Could not load backlog. Try again.',
  key: () => asyncDataKeys.space.backlog(props.spaceKey),
  messages: {
    AccessDenied: 'You do not have access to this backlog.',
    SpaceNotFound: 'The space was not found or is not available to you.',
    TemporarilyUnavailable:
      'Could not load backlog. The service is temporarily unavailable.',
  },
  watch: [() => props.spaceKey],
})
const issueAttributes = computed(() =>
  pageState.value.type === 'ready'
    ? pageState.value.data.BacklogPage.attributes
    : [],
)
const attributeFilters = computed(() =>
  normalizeIssueAttributeFilters(
    request.value.attributeQuery,
    issueAttributes.value,
  ),
)
const filterValue = computed<BacklogPageFilterValue>(() => ({
  attributes: attributeFilters.value,
}))

function updateFilters(value: BacklogPageFilterValue) {
  void router.replace({
    query: withIssueAttributeFilters(
      route.query,
      value.attributes,
      issueAttributes.value,
    ),
  })
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
useHead({
  title: computed(() =>
    pageState.value.type === 'ready'
      ? pageState.value.data.BacklogPage.title
      : 'Backlog',
  ),
})
const invalidation = useAsyncDataInvalidation()
const runSearch = createLatestRequest()
const filtering = ref(false)
const scheduleSearch = debounce(searchIssues, 300)

watch(
  () => ({
    attributeQuery: request.value.attributeQuery,
    page: request.value.page,
    search: request.value.search,
  }),
  () => {
    filtering.value = true
    scheduleSearch()
  },
)
onScopeDispose(scheduleSearch.cancel)

const loadingMoveStatuses = ref(false)
const loadingMoveSpaces = ref(false)
const loadingMoveBoards = ref(false)
const moveSpaces = ref<Array<{ label: string; value: string }>>([])
const moveBoards = ref<Array<{ label: string; value: string }>>([])
const moveStatuses = ref<Array<{ id: string; name: string }>>([])
const moving = ref(false)
const moveError = ref<null | string>(null)

watch(
  () => props.spaceKey,
  () => {
    scheduleSearch.cancel()
    runSearch.cancel()
    filtering.value = false
    loadingMoveSpaces.value = false
    loadingMoveBoards.value = false
    loadingMoveStatuses.value = false
    moveSpaces.value = []
    moveBoards.value = []
    moveStatuses.value = []
  },
)

async function loadMoveSpaces() {
  moveError.value = null
  loadingMoveSpaces.value = true
  const result = await props.deps.loadBacklogMoveSpaces()
  loadingMoveSpaces.value = false
  matchActionResult({
    err: (error) => {
      moveError.value = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have access to available spaces.',
          TemporarilyUnavailable: 'Could not load available spaces.',
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
  const sourceBoardId =
    pageState.value.type === 'ready'
      ? pageState.value.data.BacklogPage.backlogBoardId
      : undefined
  if (!sourceBoardId) {
    return
  }
  moveError.value = null
  loadingMoveBoards.value = true
  const result = await props.deps.loadBacklogMoveBoards({
    sourceBoardId,
    spaceId,
  })
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
  loadingMoveStatuses.value = true
  moveError.value = null
  const result = await props.deps.loadBacklogMoveStatuses({ boardId })
  matchActionResult({
    err: (error) => {
      moveStatuses.value = []
      moveError.value = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have access to this board.',
          BoardNotFound: 'This board no longer exists.',
          TemporarilyUnavailable: 'Could not load board statuses.',
        },
      })
    },
    ok: (value) => {
      moveStatuses.value = value.statuses
    },
    result,
  })
  loadingMoveStatuses.value = false
}

async function moveIssues(input: { issueKeys: string[]; statusId: string }) {
  moving.value = true
  moveError.value = null
  const result = await props.deps.moveBacklogIssues(input)
  matchActionResult({
    err: (error) => {
      moveError.value = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have permission to move some issues.',
          InvalidStatus: 'Select a valid board status.',
          ResourceNotFound: 'An issue or board status was not found.',
          TemporarilyUnavailable: 'Could not move some issues. Try again.',
        },
      })
    },
    ok: () => undefined,
    result,
  })
  invalidation.invalidateIssuesDataExceptBacklog(
    input.issueKeys,
    props.spaceKey,
  )
  await searchIssues()
  moving.value = false
}

async function searchIssues() {
  scheduleSearch.cancel()
  const current = outcome.value
  if (!current) {
    return
  }
  await matchActionResult({
    err: async () => undefined,
    ok: async (currentValue) => {
      filtering.value = true
      const result = await runSearch({
        request: () =>
          props.deps.searchBacklogIssues({
            backlogBoardId: currentValue.BacklogPage.backlogBoardId,
            filters: getIssueAttributeFilterInput(
              attributeFilters.value,
              issueAttributes.value,
            ),
            page: request.value.page,
            search: request.value.search,
          }),
      })
      if (!result) {
        return
      }
      filtering.value = false
      matchActionResult({
        err: (error) => {
          outcome.value = { error, ok: false }
        },
        ok: (value) => {
          outcome.value = {
            ok: true,
            value: {
              BacklogPage: {
                ...currentValue.BacklogPage,
                ...value.BacklogPage,
              },
            },
          }
        },
        result,
      })
    },
    result: current,
  })
}
</script>
