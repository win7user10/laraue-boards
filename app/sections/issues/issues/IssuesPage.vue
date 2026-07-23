<template>
  <PageState
    error-title="Could not load issues"
    loading-text="Loading issues…"
    :on-retry="query.refresh"
    :state="pageState">
    <template #default="{ data }">
      <section>
        <div class="title-row">
          <div class="page-heading">
            <ClipboardList class="page-heading-icon" />
            <div class="page-heading-text">
              <h1>All issues</h1>
            </div>
          </div>
          <NuxtLink
            v-if="data.spaces.length"
            class="primary"
            :to="organizationRoutes.newIssue()">
            <Plus />
            <span class="btn-label">Add issue</span>
          </NuxtLink>
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
            :spaces="data.spaces"
            @update:model-value="
              updateFilters({
                attributes: $event.attributes,
                spaceIds: $event.spaceIds ?? [],
              })
            " />
        </div>
        <IssueList
          empty-text="No issues yet."
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
import { ClipboardList, Plus } from 'lucide-vue-next'
import type { LocationQuery, LocationQueryRaw } from 'vue-router'

import IssueList from '~/components/issues/issue-list/IssueList.vue'
import IssueFilters from '~/components/issues/IssueFilters.vue'
import type {
  IssuesPageDeps,
  LoadMoveBoardsFailure,
  LoadMoveStatusesFailure,
  MoveIssuesFailure,
  ViewIssuesFailure,
} from '~/sections/issues/issues/IssuesPage.deps'
import { err, matchResult, ok } from '~/utils/actionResult'
import { assertNever } from '~/utils/assertNever'
import { toAsyncResultState } from '~/utils/asyncResultState'
import {
  getIssueAttributeFilterInput,
  normalizeIssueAttributeFilters,
  readIssueAttributeQuery,
  readIssueSpaceQuery,
  withIssueAttributeFilters,
} from '~/utils/issueAttributeFilters'

type FilterValue = {
  attributes: Record<string, string | string[]>
  spaceIds: string[]
}

const props = defineProps<{
  deps: IssuesPageDeps
  onUpdateQuery: (query: LocationQueryRaw) => Promise<void> | void
  organizationKey: string
  routeQuery: LocationQuery
}>()
const organizationRoutes = useOrganizationRoutes()
const request = computed(() => ({
  attributeQuery: readIssueAttributeQuery(props.routeQuery),
  page: Math.max(1, Number(props.routeQuery.page) || 1),
  search:
    typeof props.routeQuery.search === 'string' ? props.routeQuery.search : '',
  spaceIds: readIssueSpaceQuery(props.routeQuery.space),
}))
const query = await useAsyncData(
  () => `issues:${props.organizationKey}`,
  (_nuxtApp, { signal }) => props.deps.view({ ...request.value, signal }),
  { watch: [() => props.organizationKey] },
)
const getViewFailureMessage = (failure: ViewIssuesFailure): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'You do not have access to organization issues.'
    case 'temporarilyUnavailable':
      return 'Could not load issues. The service is temporarily unavailable.'
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
  normalizeIssueAttributeFilters(
    request.value.attributeQuery,
    attributes.value,
  ),
)
const filterValue = computed<FilterValue>(() => ({
  attributes: attributeFilters.value,
  spaceIds: request.value.spaceIds,
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
  const nextQuery = withIssueAttributeFilters(
    props.routeQuery,
    value.attributes,
    attributes.value,
  )
  if (value.spaceIds.length) {
    nextQuery.space = value.spaceIds
  } else {
    delete nextQuery.space
  }
  void props.onUpdateQuery(nextQuery)
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
            filters: getIssueAttributeFilterInput(
              attributeFilters.value,
              attributes.value,
            ),
            page: request.value.page,
            search: request.value.search,
            spaceIds: request.value.spaceIds,
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
  state.move.error = null
  state.move.loadingBoards = true
  const result = await props.deps.loadMoveBoards({ spaceId })
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

const getStatusesFailureMessage = (
  failure: LoadMoveStatusesFailure,
): string => {
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

async function moveIssues(input: {
  issueKeys: string[]
  statusId: string
}): Promise<boolean> {
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

watch(request, () => {
  state.filtering = true
  scheduleSearch()
})
onScopeDispose(scheduleSearch.cancel)
useHead({ title: 'All issues' })
</script>
