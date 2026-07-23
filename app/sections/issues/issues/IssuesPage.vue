<template>
  <IssuesContent
    v-if="pageState.type === 'ready'"
    :filter-value="filterValue"
    :filtering="state.filtering"
    :move="state.move"
    :on-change-move-board="changeMoveBoard"
    :on-change-move-space="changeMoveSpace"
    :on-load-move-boards="loadMoveBoards"
    :on-load-move-spaces="loadMoveSpaces"
    :on-load-move-statuses="loadMoveStatuses"
    :on-move="moveIssues"
    :on-update-filters="updateFilters"
    :on-update-page="updatePage"
    :on-update-search="updateSearch"
    :page="request.page"
    :search="request.search"
    :view-model="pageState.data.IssuesPage" />
  <PageLoadState
    v-else
    :error-text="pageState.type === 'error' ? pageState.message : ''"
    :loading="pageState.type === 'pending'"
    loading-text="Loading issues…"
    :on-retry="refresh" />
</template>

<script setup lang="ts">
import { debounce } from 'es-toolkit'

import type { IssuesPageFilterValue } from '~/sections/issues/issues/components/IssuesContent.vue'
import IssuesContent from '~/sections/issues/issues/components/IssuesContent.vue'
import type { IssuesPageDeps } from '~/sections/issues/issues/IssuesPageDeps'
import {
  getIssueAttributeFilterInput,
  normalizeIssueAttributeFilters,
  readIssueAttributeQuery,
  readIssueSpaceQuery,
  withIssueAttributeFilters,
} from '~/utils/issueAttributeFilters'

const props = defineProps<{ deps: IssuesPageDeps }>()
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

// Issue search
const runSearch = createLatestRequest()
const state = reactive({
  filtering: false,
  move: {
    boards: [] as Array<{ label: string; value: string }>,
    error: null as null | string,
    loadingBoards: false,
    loadingSpaces: false,
    loadingStatuses: false,
    moving: false,
    spaces: [] as Array<{ label: string; value: string }>,
    statuses: [] as Array<{ id: string; name: string }>,
  },
})

async function searchIssues(input: typeof request.value) {
  scheduleSearch.cancel()
  state.filtering = true
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
    state.filtering = false
  }
}

function changeMoveSpace() {
  state.move.error = null
  state.move.loadingBoards = false
  state.move.loadingStatuses = false
  state.move.boards = []
  state.move.statuses = []
}

function changeMoveBoard() {
  state.move.error = null
  state.move.loadingStatuses = false
  state.move.statuses = []
}

async function loadMoveSpaces() {
  state.move.error = null
  state.move.loadingSpaces = true
  const result = await props.deps.issueList.loadMoveSpaces()
  state.move.loadingSpaces = false
  matchActionResult({
    err: (error) => {
      state.move.error = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have access to available spaces.',
          TemporarilyUnavailable: 'Could not load available spaces.',
        },
      })
    },
    ok: ({ spaces }) => {
      state.move.spaces = spaces
    },
    result,
  })
}

async function loadMoveBoards(spaceId: string) {
  state.move.error = null
  state.move.loadingBoards = true
  const result = await props.deps.issueList.loadMoveBoards({
    sourceBoardId: null,
    spaceId,
  })
  state.move.loadingBoards = false
  matchActionResult({
    err: (error) => {
      state.move.error = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have access to this space.',
          SpaceNotFound: 'This space no longer exists.',
          TemporarilyUnavailable: 'Could not load space boards.',
        },
      })
    },
    ok: ({ boards }) => {
      state.move.boards = boards
    },
    result,
  })
}

async function loadMoveStatuses(boardId: string) {
  state.move.error = null
  state.move.loadingStatuses = true
  const result = await props.deps.issueList.loadMoveStatuses({ boardId })
  state.move.loadingStatuses = false
  matchActionResult({
    err: (error) => {
      state.move.error = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have access to this board.',
          BoardNotFound: 'This board no longer exists.',
          TemporarilyUnavailable: 'Could not load board columns.',
        },
      })
    },
    ok: ({ statuses }) => {
      state.move.statuses = statuses
    },
    result,
  })
}

async function moveIssues(input: {
  issueKeys: string[]
  statusId: string
}): Promise<boolean> {
  state.move.error = null
  state.move.moving = true
  const result = await props.deps.issueList.moveIssues(input)
  const moved = await matchActionResult({
    err: async (error) => {
      state.move.error = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have permission to move some issues.',
          InvalidStatus: 'Select a valid board column.',
          ResourceNotFound: 'An issue or board column was not found.',
          TemporarilyUnavailable: 'Could not move some issues. Try again.',
        },
      })
      return false
    },
    ok: async () => {
      await searchIssues(request.value)
      return true
    },
    result,
  })
  state.move.moving = false
  return moved
}

const scheduleSearch = debounce(searchIssues, 300)
watch(request, (input) => {
  state.filtering = true
  scheduleSearch(input)
})
onScopeDispose(scheduleSearch.cancel)
</script>
