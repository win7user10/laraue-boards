<template>
  <PageState
    error-title="Could not load backlog"
    loading-text="Loading backlog…"
    :on-retry="query.refresh"
    :state="pageState">
    <template #default="{ data }">
      <section>
        <div class="title-row">
          <div class="page-heading">
            <AppBackLink
              label="Back to space"
              :to="organizationRoutes.space(data.spaceKey)" />
            <ListTodo
              class="page-heading-icon"
              :style="{ color: data.color }" />
            <div class="page-heading-text">
              <h1>{{ data.title }}</h1>
            </div>
          </div>
          <div class="title-actions">
            <NuxtLink
              class="primary"
              :to="organizationRoutes.newBacklogIssue(data.spaceKey)">
              <Plus />
              <span class="btn-label">Add issue</span>
            </NuxtLink>
          </div>
        </div>
        <div class="toolbar">
          <input
            aria-label="Search issues"
            placeholder="Search issues"
            type="search"
            :value="request.search"
            @input="updateSearch(($event.target as HTMLInputElement).value)" />
          <IssueFilters
            :attributes="data.attributes"
            :loading="state.filtering"
            :model-value="filterValue"
            @update:model-value="updateFilters" />
        </div>
        <IssueList
          empty-text="The backlog is empty."
          :filtering="state.filtering"
          :has-next-page="data.hasNextPage"
          :issues="data.issues"
          :move="state.move"
          :on-change-move-board="changeMoveBoard"
          :on-change-move-space="changeMoveSpace"
          :on-load-move-boards="loadMoveBoards"
          :on-load-move-spaces="loadMoveSpaces"
          :on-load-move-statuses="loadMoveStatuses"
          :on-move="moveIssues"
          :on-update-page="updatePage"
          :page="request.page" />
      </section>
    </template>
  </PageState>
</template>

<script setup lang="ts">
import { debounce } from 'es-toolkit'
import { ListTodo, Plus } from 'lucide-vue-next'
import type { LocationQuery, LocationQueryRaw } from 'vue-router'

import IssueList from '~/components/issues/issue-list/IssueList.vue'
import IssueFilters from '~/components/issues/IssueFilters.vue'
import type {
  BacklogPageDeps,
  LoadMoveBoardsFailure,
  LoadMoveStatusesFailure,
  MoveIssuesFailure,
  ViewBacklogFailure,
} from '~/sections/spaces/backlog/BacklogPage.deps'
import { err, matchResult, ok } from '~/utils/actionResult'
import { assertNever } from '~/utils/assertNever'
import { toAsyncResultState } from '~/utils/asyncResultState'
import {
  getIssueAttributeFilterInput,
  normalizeIssueAttributeFilters,
  readIssueAttributeQuery,
  withIssueAttributeFilters,
} from '~/utils/issueAttributeFilters'

type FilterValue = {
  attributes: Record<string, string | string[]>
}

const props = defineProps<{
  deps: BacklogPageDeps
  onUpdateQuery: (query: LocationQueryRaw) => Promise<void> | void
  routeQuery: LocationQuery
  spaceKey: string
}>()
const organizationRoutes = useOrganizationRoutes()
const request = computed(() => ({
  attributeQuery: readIssueAttributeQuery(props.routeQuery),
  page: Math.max(1, Number(props.routeQuery.page) || 1),
  search: typeof props.routeQuery.search === 'string' ? props.routeQuery.search : '',
}))
const query = await useAsyncData(
  () => `backlog:${props.spaceKey}`,
  (_nuxtApp, { signal }) =>
    props.deps.view({
      ...request.value,
      signal,
      spaceKey: props.spaceKey,
    }),
  { watch: [() => props.spaceKey] },
)
const getViewFailureMessage = (failure: ViewBacklogFailure): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'You do not have access to this backlog.'
    case 'spaceNotFound':
      return 'The space was not found or is not available to you.'
    case 'temporarilyUnavailable':
      return 'Could not load backlog. The service is temporarily unavailable.'
    default:
      return assertNever(failure)
  }
}
const pageState = computed(() =>
  toAsyncResultState({
    error: query.error.value,
    getErrorMessage: getViewFailureMessage,
    result: query.data.value,
    status: query.status.value,
  }),
)
const attributes = computed(() =>
  pageState.value.type === 'ready' ? pageState.value.data.attributes : [],
)
const attributeFilters = computed(() =>
  normalizeIssueAttributeFilters(request.value.attributeQuery, attributes.value),
)
const filterValue = computed<FilterValue>(() => ({
  attributes: attributeFilters.value,
}))
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
const runSearch = createLatestRequest()
const scheduleSearch = debounce(searchIssues, 300)

function updateFilters(value: FilterValue) {
  void props.onUpdateQuery(
    withIssueAttributeFilters(props.routeQuery, value.attributes, attributes.value),
  )
}

function updatePage(value: number) {
  const nextQuery: LocationQueryRaw = { ...props.routeQuery }
  if (value > 1) {
    nextQuery.page = String(value)
  } else {
    delete nextQuery.page
  }
  void props.onUpdateQuery(nextQuery)
}

function updateSearch(value: string) {
  const nextQuery: LocationQueryRaw = { ...props.routeQuery }
  delete nextQuery.page
  if (value) {
    nextQuery.search = value
  } else {
    delete nextQuery.search
  }
  void props.onUpdateQuery(nextQuery)
}

async function searchIssues() {
  scheduleSearch.cancel()
  const current = query.data.value
  if (!current) {
    return
  }
  await matchResult(current, {
    err: () => undefined,
    ok: async (data) => {
      state.filtering = true
      const result = await runSearch({
        request: () =>
          props.deps.search({
            backlogBoardId: data.backlogBoardId,
            filters: getIssueAttributeFilterInput(attributeFilters.value, attributes.value),
            page: request.value.page,
            search: request.value.search,
          }),
      })
      if (!result) {
        return
      }
      state.filtering = false
      matchResult(result, {
        err: (failure) => {
          query.data.value = err(failure)
        },
        ok: (value) => {
          query.data.value = ok({ ...data, ...value })
        },
      })
    },
  })
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
  const result = await props.deps.loadMoveSpaces()
  state.move.loadingSpaces = false
  matchResult(result, {
    err: (failure) => {
      state.move.error =
        failure.type === 'accessDenied'
          ? 'You do not have access to available spaces.'
          : 'Could not load available spaces.'
    },
    ok: ({ spaces }) => {
      state.move.spaces = spaces
    },
  })
}

const getBoardsFailureMessage = (failure: LoadMoveBoardsFailure): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'You do not have access to this space.'
    case 'spaceNotFound':
      return 'This space no longer exists.'
    case 'temporarilyUnavailable':
      return 'Could not load space boards.'
    default:
      return assertNever(failure)
  }
}

async function loadMoveBoards(spaceId: string) {
  const current = pageState.value
  if (current.type !== 'ready') {
    return
  }
  state.move.error = null
  state.move.loadingBoards = true
  const result = await props.deps.loadMoveBoards({
    sourceBoardId: current.data.backlogBoardId,
    spaceId,
  })
  state.move.loadingBoards = false
  matchResult(result, {
    err: (failure) => {
      state.move.error = getBoardsFailureMessage(failure)
    },
    ok: ({ boards }) => {
      state.move.boards = boards
    },
  })
}

const getStatusesFailureMessage = (failure: LoadMoveStatusesFailure): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'You do not have access to this board.'
    case 'boardNotFound':
      return 'This board no longer exists.'
    case 'temporarilyUnavailable':
      return 'Could not load board columns.'
    default:
      return assertNever(failure)
  }
}

async function loadMoveStatuses(boardId: string) {
  state.move.error = null
  state.move.loadingStatuses = true
  const result = await props.deps.loadMoveStatuses({ boardId })
  state.move.loadingStatuses = false
  matchResult(result, {
    err: (failure) => {
      state.move.error = getStatusesFailureMessage(failure)
    },
    ok: ({ statuses }) => {
      state.move.statuses = statuses
    },
  })
}

const getMoveFailureMessage = (failure: MoveIssuesFailure): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'You do not have permission to move some issues.'
    case 'invalidStatus':
      return 'Select a valid board column.'
    case 'resourceNotFound':
      return 'An issue or board column was not found.'
    case 'temporarilyUnavailable':
      return 'Could not move some issues. Try again.'
    default:
      return assertNever(failure)
  }
}

async function moveIssues(input: { issueKeys: string[]; statusId: string }): Promise<boolean> {
  state.move.error = null
  state.move.moving = true
  const result = await props.deps.moveIssues(input)
  const moved = await matchResult(result, {
    err: (failure) => {
      state.move.error = getMoveFailureMessage(failure)
      return false
    },
    ok: async () => {
      await searchIssues()
      return true
    },
  })
  state.move.moving = false
  return moved
}

watch(
  () => ({
    attributeQuery: request.value.attributeQuery,
    page: request.value.page,
    search: request.value.search,
  }),
  () => {
    state.filtering = true
    scheduleSearch()
  },
)
watch(
  () => props.spaceKey,
  () => {
    scheduleSearch.cancel()
    runSearch.cancel()
    state.filtering = false
  },
)
onScopeDispose(scheduleSearch.cancel)
useHead({
  title: computed(() =>
    pageState.value.type === 'ready' ? pageState.value.data.title : 'Backlog',
  ),
})
</script>
