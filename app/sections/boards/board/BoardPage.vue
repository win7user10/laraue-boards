<template>
  <PageState
    error-title="Could not load board"
    loading-text="Loading board…"
    :on-retry="query.refresh"
    :state="pageState">
    <template #default="{ data }">
      <section class="board-content">
        <div class="title-row">
          <div class="page-heading">
            <AppBackLink
              label="Back to space"
              :to="organizationRoutes.space(spaceKey)" />
            <BoardIcon
              class="page-heading-icon"
              :style="{ color: data.BoardPage.color || undefined }" />
            <div class="page-heading-text">
              <h1>{{ data.BoardPage.title }}</h1>
            </div>
          </div>
          <div class="title-actions">
            <NuxtLink
              v-if="data.BoardPage.canUpdate || data.BoardPage.canDelete"
              aria-label="Board settings"
              class="secondary"
              :to="organizationRoutes.boardSettings(spaceKey, data.BoardPage.id)">
              <Settings />
              <span class="btn-label">Settings</span>
            </NuxtLink>
            <NuxtLink
              v-if="data.BoardPage.canCreateIssues"
              class="primary"
              :to="organizationRoutes.newBoardIssue(spaceKey, data.BoardPage.id)">
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
            :value="search"
            @input="updateSearch(($event.target as HTMLInputElement).value)" />
          <IssueFilters
            :attributes="data.BoardPage.attributes"
            :loading="state.filtering"
            :model-value="filterValue"
            @update:model-value="updateFilters" />
        </div>

        <p
          v-if="state.moveError"
          class="form-error"
          role="alert">
          {{ state.moveError }}
        </p>

        <DragDropProvider
          :plugins="defaultPreset.plugins"
          :sensors="sensors"
          @drag-end="handleDragEnd"
          @drag-start="state.dragging = true">
          <div
            id="board-scroll-area"
            ref="board"
            :aria-busy="state.filtering || state.movingIssueKeys.size > 0"
            class="board"
            :class="{
              'board--dragging': state.dragging,
              'results-stale': state.filtering,
            }">
            <BoardColumn
              v-for="column in data.BoardPage.columns"
              :key="column.id"
              :can-move-issues="data.BoardPage.canMoveIssues"
              :load-more-error="state.loadMoreErrors.get(column.id) ?? null"
              :loading-more="state.loadingColumnIds.has(column.id)"
              :moving-issue-keys="state.movingIssueKeys"
              :on-load-more="loadMoreIssues"
              :on-move-to-backlog="moveToBacklog"
              :on-open-issue="openIssue"
              :view-model="column" />
          </div>
          <BoardScrollMap
            :column-count="data.BoardPage.columns.length"
            :target="board" />
        </DragDropProvider>
        <IssueDialog
          v-if="issueKey && !state.closingIssueDialog"
          :deps="deps.issueDialog"
          :issue-key="issueKey"
          :on-close="closeIssueDialog"
          :on-deleted="handleIssueDeleted"
          :on-saved="handleIssueSaved" />
      </section>
    </template>
  </PageState>
</template>

<script lang="ts">
import type {
  LoadMoreBoardIssuesResult,
  SearchBoardIssuesResult,
} from '~/sections/boards/board/BoardPage.deps'
import type { BoardColumnViewModel } from '~/sections/boards/board/components/BoardColumn/BoardColumn.vue'

type BoardPageAttributeViewModel =
  | { color: string; id: string; name: string; type: 'text' }
  | {
      color: string
      id: string
      name: string
      options: Array<{ label: string; value: string }>
      type: 'list'
    }

type BoardPageFilterValue = {
  attributes: Record<string, string | string[]>
}

export type BoardPageViewModel = {
  attributes: BoardPageAttributeViewModel[]
  canCreateIssues: boolean
  canDelete: boolean
  canMoveIssues: boolean
  canUpdate: boolean
  color: null | string
  columns: BoardColumnViewModel[]
  id: string
  issueCount: number
  title: string
}

function mergeRefreshedBoard(
  board: BoardPageViewModel,
  refreshedColumns: ReadonlyMap<string, LoadMoreBoardIssuesResult>,
  summary?: SearchBoardIssuesResult,
): BoardPageViewModel {
  const summaryColumns = new Map(summary?.BoardPage.columns.map((column) => [column.id, column]))
  const columns = board.columns.map((column) => {
    const refreshed = refreshedColumns.get(column.id)
    const refreshedSummary = summaryColumns.get(column.id)
    return refreshed
      ? {
          ...column,
          hasNext: refreshed.hasNext,
          issueCount: refreshedSummary?.issueCount ?? column.issueCount,
          issues: refreshed.issues,
        }
      : column
  })

  return {
    ...board,
    columns,
    issueCount: summary?.BoardPage.issueCount ?? board.issueCount,
  }
}
</script>

<script setup lang="ts">
import { defaultPreset, PointerActivationConstraints } from '@dnd-kit/dom'
import { DragDropProvider, KeyboardSensor, PointerSensor } from '@dnd-kit/vue'
import type { DragEndEvent } from '@dnd-kit/vue'
import { debounce } from 'es-toolkit'
import { Plus, Settings } from 'lucide-vue-next'
import type { LocationQuery, LocationQueryRaw } from 'vue-router'

import IssueFilters from '~/components/issues/IssueFilters.vue'
import { BoardIcon } from '~/constants/icons'
import type {
  BoardPageDeps,
  LoadBoardIssuesFailure,
  MoveIssueToBacklogFailure,
  ViewBoardPageFailure,
} from '~/sections/boards/board/BoardPage.deps'
import BoardColumn from '~/sections/boards/board/components/BoardColumn/BoardColumn.vue'
import BoardScrollMap from '~/sections/boards/board/components/BoardScrollMap/BoardScrollMap.vue'
import type { MoveIssueFailure } from '~/sections/boards/board/components/IssueDialog/IssueDialog.deps'
import type { IssueDialogSavedIssue } from '~/sections/boards/board/components/IssueDialog/IssueDialog.vue'
import { assertNever } from '~/utils/assertNever'
import { toAsyncResultState } from '~/utils/asyncResultState'
import {
  getIssueAttributeFilterInput,
  normalizeIssueAttributeFilters,
  readIssueAttributeQuery,
  withIssueAttributeFilters,
} from '~/utils/issueAttributeFilters'

const props = defineProps<{
  boardId: string
  deps: BoardPageDeps
  issueKey: null | string
  onBack: () => void
  onPushQuery: (query: LocationQueryRaw) => Promise<void> | void
  onReplaceQuery: (query: LocationQueryRaw) => Promise<void> | void
  routePath: string
  routeQuery: LocationQuery
  spaceKey: string
}>()

const IssueDialog = defineAsyncComponent(
  () => import('~/sections/boards/board/components/IssueDialog/IssueDialog.vue'),
)
const organizationRoutes = useOrganizationRoutes()
const board = ref<HTMLElement | null>(null)
const sensors = [
  PointerSensor.configure({
    activationConstraints: (event) =>
      event.pointerType === 'touch'
        ? [new PointerActivationConstraints.Delay({ tolerance: 5, value: 250 })]
        : [new PointerActivationConstraints.Distance({ value: 6 })],
    preventActivation: () => false,
  }),
  KeyboardSensor,
]

const LOAD_MORE_TAKE = 25

const search = computed(() =>
  typeof props.routeQuery.search === 'string' ? props.routeQuery.search : '',
)
const attributeQuery = computed(() => readIssueAttributeQuery(props.routeQuery))
const state = reactive({
  closingIssueDialog: false,
  dragging: false,
  filtering: false,
  loadingColumnIds: new Set<string>(),
  loadMoreErrors: new Map<string, string>(),
  moveError: null as null | string,
  movingIssueKeys: new Set<string>(),
})

const query = await useAsyncData(
  () => `board:${props.boardId}`,
  (_nuxtApp, { signal }) =>
    props.deps.view({
      attributeQuery: attributeQuery.value,
      boardId: props.boardId,
      search: search.value,
      signal,
    }),
  { watch: [() => props.boardId] },
)

const getViewFailureMessage = (failure: ViewBoardPageFailure): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'You do not have access to this board.'
    case 'boardNotFound':
      return 'The board was not found or is not available to you.'
    case 'temporarilyUnavailable':
      return 'Could not load the board. The service is temporarily unavailable.'
    default:
      return assertNever(failure)
  }
}

const getIssuesFailureMessage = (
  failure: LoadBoardIssuesFailure,
  temporarilyUnavailable: string,
): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'You do not have permission to view these issues.'
    case 'temporarilyUnavailable':
      return temporarilyUnavailable
    default:
      return assertNever(failure)
  }
}

const getMoveFailureMessage = (failure: MoveIssueFailure): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'You do not have permission to move this issue.'
    case 'invalidStatus':
      return 'This issue cannot be moved to that column.'
    case 'resourceNotFound':
      return 'The issue or destination column no longer exists.'
    case 'temporarilyUnavailable':
      return 'Could not move the issue. Try again.'
    default:
      return assertNever(failure)
  }
}

const getMoveToBacklogFailureMessage = (failure: MoveIssueToBacklogFailure): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'You do not have permission to move this issue.'
    case 'alreadyInBacklog':
      return 'This issue is already in the backlog.'
    case 'resourceNotFound':
      return 'The issue or backlog board no longer exists.'
    case 'temporarilyUnavailable':
      return 'Could not move the issue to the backlog. Try again.'
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
const outcome = query.data
const viewModel = computed(() => {
  return pageState.value.type === 'ready' ? pageState.value.data : undefined
})
const issueAttributes = computed(() => viewModel.value?.BoardPage.attributes ?? [])
const attributeFilters = computed(() =>
  normalizeIssueAttributeFilters(attributeQuery.value, issueAttributes.value),
)
const filterValue = computed<BoardPageFilterValue>(() => ({
  attributes: attributeFilters.value,
}))
const filterInput = computed(() =>
  getIssueAttributeFilterInput(attributeFilters.value, issueAttributes.value),
)
const filterKey = computed(() => JSON.stringify(filterInput.value))

function updateFilters(value: BoardPageFilterValue) {
  void props.onReplaceQuery(
    withIssueAttributeFilters(props.routeQuery, value.attributes, issueAttributes.value),
  )
}

function updateSearch(value: string) {
  const routeQuery = { ...props.routeQuery }
  if (value) {
    routeQuery.search = value
  } else {
    delete routeQuery.search
  }
  void props.onReplaceQuery(routeQuery)
}

function openIssue(issueKey: string) {
  void props.onPushQuery({ ...props.routeQuery, issue: issueKey })
}

useHead({
  title: computed(() => viewModel.value?.BoardPage.title ?? 'Board'),
})
const runSearch = createLatestRequest()
const scheduleSearch = debounce(searchIssues, 300)

watch([search, filterKey], () => {
  state.filtering = true
  scheduleSearch()
})
onScopeDispose(scheduleSearch.cancel)

watch(
  () => props.issueKey,
  () => {
    state.closingIssueDialog = false
  },
)

watch(
  () => props.boardId,
  () => {
    scheduleSearch.cancel()
    runSearch.cancel()
    state.filtering = false
    state.loadingColumnIds.clear()
    state.loadMoreErrors.clear()
  },
)

function closeIssueDialog() {
  state.closingIssueDialog = true
  const backState = window.history.state?.back
  const historyBackPath = typeof backState === 'string' ? (backState.split('?')[0] ?? null) : null
  const target = resolveIssueDialogCloseTarget({
    currentPath: props.routePath,
    currentQuery: props.routeQuery as Record<string, string>,
    historyBackPath,
  })
  if (target.type === 'back') {
    props.onBack()
    return
  }
  void props.onReplaceQuery(target.query)
}

function handleIssueSaved(issue: IssueDialogSavedIssue) {
  scheduleSearch.cancel()
  runSearch.cancel()
  state.filtering = false
  const current = viewModel.value
  const affectedColumnIds = new Set<string>()
  if (current) {
    if (issue.previousBoardId === current.BoardPage.id) {
      affectedColumnIds.add(issue.previousStatusId)
    }
    if (issue.boardId === current.BoardPage.id) {
      affectedColumnIds.add(issue.statusId)
    }
    outcome.value = {
      ok: true,
      value: {
        BoardPage: updateIssueInBoard(current.BoardPage, issue),
      },
    }
  }
  void refreshLoadedIssues(affectedColumnIds)
}

function handleIssueDeleted(issueKey: string) {
  scheduleSearch.cancel()
  runSearch.cancel()
  state.filtering = false
  const current = viewModel.value
  if (current) {
    outcome.value = {
      ok: true,
      value: {
        BoardPage: removeIssueFromBoard(current.BoardPage, issueKey),
      },
    }
  }
}

async function searchIssues() {
  scheduleSearch.cancel()
  state.filtering = true
  const result = await runSearch({
    request: () =>
      props.deps.searchBoardIssues({
        boardId: props.boardId,
        filters: filterInput.value,
        search: search.value,
        take: LOAD_MORE_TAKE,
      }),
  })
  if (!result) {
    return
  }
  state.filtering = false
  matchResult(result, {
    err: (error) => {
      outcome.value = { error, ok: false }
    },
    ok: (value) => {
      const current = outcome.value
      if (!current) {
        return
      }
      matchResult(current, {
        err: () => undefined,
        ok: (currentValue) => {
          const issuesByColumn = new Map(
            value.BoardPage.columns.map((column) => [column.id, column]),
          )
          outcome.value = {
            ok: true,
            value: {
              BoardPage: {
                ...currentValue.BoardPage,
                columns: currentValue.BoardPage.columns.map((column) => {
                  const issues = issuesByColumn.get(column.id)
                  return {
                    ...column,
                    issueCount: issues?.issueCount ?? 0,
                    issues: issues?.issues ?? [],
                  }
                }),
                issueCount: value.BoardPage.issueCount,
              },
            },
          }
        },
      })
    },
  })
}

async function refreshLoadedIssues(statusIds: ReadonlySet<string>) {
  const current = viewModel.value
  if (!current || statusIds.size === 0) {
    return
  }

  const result = await runSearch({
    request: async () => {
      const [columns, summary] = await Promise.all([
        Promise.all(
          current.BoardPage.columns
            .filter((column) => statusIds.has(column.id))
            .map(async (column) => ({
              columnId: column.id,
              result: await props.deps.loadMoreBoardIssues({
                filters: filterInput.value,
                offset: 0,
                search: search.value,
                statusId: column.id,
                take: Math.max(LOAD_MORE_TAKE, column.issues.length),
              }),
            })),
        ),
        props.deps.searchBoardIssues({
          boardId: props.boardId,
          filters: filterInput.value,
          search: search.value,
          take: 1,
        }),
      ])
      return { columns, summary }
    },
  })
  if (!result) {
    return
  }

  const refreshedColumns = new Map<string, LoadMoreBoardIssuesResult>()
  for (const response of result.columns) {
    matchResult(response.result, {
      err: (error) => {
        state.loadMoreErrors.set(
          response.columnId,
          getIssuesFailureMessage(error, 'Could not refresh this column.'),
        )
      },
      ok: (value) => {
        state.loadMoreErrors.delete(response.columnId)
        refreshedColumns.set(response.columnId, value)
      },
    })
  }

  let refreshedSummary: SearchBoardIssuesResult | undefined
  matchResult(result.summary, {
    err: () => undefined,
    ok: (value) => (refreshedSummary = value),
  })

  const latest = viewModel.value
  if (!latest) {
    return
  }
  outcome.value = {
    ok: true,
    value: {
      BoardPage: mergeRefreshedBoard(latest.BoardPage, refreshedColumns, refreshedSummary),
    },
  }
}

async function moveIssue(input: { issueKey: string; statusId: string }) {
  const current = viewModel.value
  const sourceColumn = current?.BoardPage.columns.find((column) =>
    column.issues.some((issue) => issue.issueKey === input.issueKey),
  )
  if (
    !current ||
    !sourceColumn ||
    sourceColumn.id === input.statusId ||
    state.movingIssueKeys.has(input.issueKey)
  ) {
    return
  }

  scheduleSearch.cancel()
  runSearch.cancel()
  state.filtering = false
  state.moveError = null
  state.movingIssueKeys.add(input.issueKey)
  outcome.value = {
    ok: true,
    value: {
      BoardPage: moveIssueInBoard(current.BoardPage, input.issueKey, input.statusId),
    },
  }
  const result = await props.deps.moveBoardIssue(input)
  matchResult(result, {
    err: (error) => {
      const optimistic = viewModel.value
      if (optimistic) {
        outcome.value = {
          ok: true,
          value: {
            BoardPage: moveIssueInBoard(optimistic.BoardPage, input.issueKey, sourceColumn.id),
          },
        }
      }
      state.moveError = getMoveFailureMessage(error)
    },
    ok: () => undefined,
  })
  state.movingIssueKeys.delete(input.issueKey)
}

async function moveToBacklog(issueKey: string) {
  const current = viewModel.value
  if (!current || state.movingIssueKeys.has(issueKey)) {
    return
  }

  state.moveError = null
  state.movingIssueKeys.add(issueKey)
  const result = await props.deps.moveIssueToBacklog({
    boardId: props.boardId,
    issueKey,
    spaceKey: props.spaceKey,
  })
  matchResult(result, {
    err: (error) => {
      state.moveError = getMoveToBacklogFailureMessage(error)
    },
    ok: () => {
      outcome.value = {
        ok: true,
        value: {
          BoardPage: removeIssueFromBoard(current.BoardPage, issueKey),
        },
      }
    },
  })
  state.movingIssueKeys.delete(issueKey)
}

async function loadMoreIssues(statusId: string) {
  const current = viewModel.value
  const column = current?.BoardPage.columns.find((c) => c.id === statusId)
  if (!current || !column || !column.hasNext || state.loadingColumnIds.has(statusId)) {
    return
  }

  state.loadingColumnIds.add(statusId)
  state.loadMoreErrors.delete(statusId)
  const requestedSearch = search.value
  const requestedFilterKey = filterKey.value

  const result = await props.deps.loadMoreBoardIssues({
    filters: filterInput.value,
    offset: column.issues.length,
    search: requestedSearch,
    statusId,
    take: LOAD_MORE_TAKE,
  })

  state.loadingColumnIds.delete(statusId)

  if (search.value !== requestedSearch || filterKey.value !== requestedFilterKey) {
    return
  }
  matchResult(result, {
    err: (error) => {
      state.loadMoreErrors.set(
        statusId,
        getIssuesFailureMessage(error, 'Could not load more issues. Scroll to retry.'),
      )
    },
    ok: (value) => {
      const latest = viewModel.value
      if (!latest) {
        return
      }
      outcome.value = {
        ok: true,
        value: {
          BoardPage: {
            ...latest.BoardPage,
            columns: latest.BoardPage.columns.map((c) =>
              c.id === statusId
                ? {
                    ...c,
                    hasNext: value.hasNext,
                    issues: [...c.issues, ...value.issues],
                  }
                : c,
            ),
          },
        },
      }
    },
  })
}

function removeIssueFromBoard(boardData: BoardPageViewModel, issueKey: string): BoardPageViewModel {
  const source = boardData.columns.find((column) =>
    column.issues.some((issue) => issue.issueKey === issueKey),
  )
  if (!source) {
    return boardData
  }

  return {
    ...boardData,
    columns: boardData.columns.map((column) =>
      column === source
        ? {
            ...column,
            issueCount: column.issueCount - 1,
            issues: column.issues.filter((item) => item.issueKey !== issueKey),
          }
        : column,
    ),
    issueCount: Math.max(0, boardData.issueCount - 1),
  }
}

function moveIssueInBoard(
  boardData: BoardPageViewModel,
  issueKey: string,
  statusId: string,
): BoardPageViewModel {
  const source = boardData.columns.find((column) =>
    column.issues.some((issue) => issue.issueKey === issueKey),
  )
  const target = boardData.columns.find((column) => column.id === statusId)
  const issue = source?.issues.find((item) => item.issueKey === issueKey)
  if (!source || !target || !issue || source === target) {
    return boardData
  }

  return {
    ...boardData,
    columns: boardData.columns.map((column) => {
      if (column === source) {
        return {
          ...column,
          issueCount: column.issueCount - 1,
          issues: column.issues.filter((item) => item !== issue),
        }
      }
      if (column === target) {
        return {
          ...column,
          issueCount: column.issueCount + 1,
          issues: [...column.issues, issue],
        }
      }
      return column
    }),
  }
}

function updateIssueInBoard(
  boardData: BoardPageViewModel,
  update: IssueDialogSavedIssue,
): BoardPageViewModel {
  const hasIssue = boardData.columns.some((column) =>
    column.issues.some((issue) => issue.issueKey === update.issueKey),
  )
  if (!hasIssue) {
    return boardData
  }
  if (update.boardId !== boardData.id) {
    return removeIssueFromBoard(boardData, update.issueKey)
  }

  const updated = moveIssueInBoard(boardData, update.issueKey, update.statusId)
  return {
    ...updated,
    columns: updated.columns.map((column) => ({
      ...column,
      issues: column.issues.map((issue) =>
        issue.issueKey === update.issueKey ? { ...issue, content: update.content } : issue,
      ),
    })),
  }
}

function handleDragEnd(event: DragEndEvent) {
  state.dragging = false
  if (event.canceled) {
    return
  }

  const issueKey = event.operation.source?.id
  const statusId = event.operation.target?.id
  if (typeof issueKey !== 'string' || typeof statusId !== 'string') {
    return
  }

  const current = viewModel.value?.BoardPage
  const sourceColumn = current?.columns.find((column) =>
    column.issues.some((issue) => issue.issueKey === issueKey),
  )
  if (sourceColumn && sourceColumn.id !== statusId) {
    void moveIssue({ issueKey, statusId })
  }
}

function resolveIssueDialogCloseTarget(input: {
  currentPath: string
  currentQuery: Record<string, string>
  historyBackPath: null | string
}) {
  if (input.historyBackPath === input.currentPath) {
    return { type: 'back' as const }
  }
  const routeQuery = { ...input.currentQuery }
  delete routeQuery.issue
  return { query: routeQuery, type: 'replace' as const }
}
</script>

<style scoped>
.board-content {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.board {
  display: grid;
  flex: 1;
  gap: var(--space-3);
  grid-auto-columns: 300px;
  grid-auto-flow: column;
  grid-template-columns: none;
  grid-template-rows: 1fr;
  margin-top: var(--space-5);
  min-height: 0;
  overflow-x: auto;
  padding-bottom: var(--space-4);
}

@media (max-width: 760px) {
  .board {
    gap: var(--space-2);
    grid-auto-columns: 100%;
    grid-auto-flow: column;
    grid-template-columns: none;
    margin-top: var(--space-3);
    overscroll-behavior-inline: contain;
  }
}
</style>
