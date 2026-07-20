<template>
  <section
    v-if="pageState.type === 'ready'"
    class="board-content">
    <div class="title-row">
      <div class="page-heading">
        <AppBackLink
          label="Back to space"
          :to="organizationRoutes.space(spaceKey)" />
        <BoardIcon
          class="page-heading-icon"
          :style="{ color: pageState.data.BoardPage.color || undefined }" />
        <div class="page-heading-text">
          <h1>{{ pageState.data.BoardPage.title }}</h1>
        </div>
      </div>
      <div class="title-actions">
        <NuxtLink
          v-if="
            pageState.data.BoardPage.canUpdate ||
            pageState.data.BoardPage.canDelete
          "
          aria-label="Board settings"
          class="secondary"
          :to="
            organizationRoutes.boardSettings(
              spaceKey,
              pageState.data.BoardPage.id,
            )
          ">
          <Settings />
          <span class="btn-label">Settings</span>
        </NuxtLink>
        <NuxtLink
          v-if="pageState.data.BoardPage.canCreateIssues"
          class="primary"
          :to="
            organizationRoutes.newBoardIssue(
              spaceKey,
              pageState.data.BoardPage.id,
            )
          ">
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
        :attributes="pageState.data.BoardPage.attributes"
        :loading="filtering"
        :model-value="filterValue"
        @update:model-value="updateFilters" />
    </div>

    <p
      v-if="moveError"
      class="form-error"
      role="alert">
      {{ moveError }}
    </p>

    <DragDropProvider
      :plugins="defaultPreset.plugins"
      :sensors="sensors"
      @drag-end="handleDragEnd"
      @drag-start="dragging = true">
      <div
        id="board-scroll-area"
        ref="board"
        :aria-busy="filtering || movingIssueKeys.size > 0"
        class="board"
        :class="{
          'board--dragging': dragging,
          'results-stale': filtering,
        }">
        <BoardColumn
          v-for="column in pageState.data.BoardPage.columns"
          :key="column.id"
          :can-move-issues="pageState.data.BoardPage.canMoveIssues"
          :load-more-error="loadMoreErrors.get(column.id) ?? null"
          :loading-more="loadingColumnIds.has(column.id)"
          :moving-issue-keys="movingIssueKeys"
          :on-load-more="loadMoreIssues"
          :on-move-to-backlog="moveToBacklog"
          :on-open-issue="openIssue"
          :view-model="column" />
      </div>
      <BoardScrollMap
        :column-count="pageState.data.BoardPage.columns.length"
        :target="board" />
    </DragDropProvider>
    <IssueDialog
      v-if="issueKey && !closingIssueDialog"
      :deps="deps.issueDialog"
      :issue-key="issueKey"
      :on-close="closeIssueDialog"
      :on-deleted="handleIssueDeleted"
      :on-saved="handleIssueSaved" />
  </section>
  <PageLoadState
    v-else
    :error-text="pageState.type === 'error' ? pageState.message : ''"
    :loading="pageState.type === 'pending'"
    loading-text="Loading board…"
    :on-retry="refresh" />
</template>

<script lang="ts">
import type { BoardColumnViewModel } from '~/sections/boards/board/components/BoardColumn/BoardColumn.vue'
import type { LoadMoreBoardIssuesResult } from '~/sections/boards/board/deps/loadMoreBoardIssues'
import type { SearchBoardIssuesResult } from '~/sections/boards/board/deps/searchBoardIssues'

export type BoardPageAttributeViewModel =
  | { color: string; id: string; name: string; type: 'text' }
  | {
      color: string
      id: string
      name: string
      options: Array<{ label: string; value: string }>
      type: 'list'
    }

export type BoardPageFilterValue = {
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
  const summaryColumns = new Map(
    summary?.BoardPage.columns.map((column) => [column.id, column]),
  )
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

import IssueFilters from '~/components/issues/IssueFilters.vue'
import { BoardIcon } from '~/constants/icons'
import type { BoardPageDeps } from '~/sections/boards/board/BoardPageDeps'
import BoardColumn from '~/sections/boards/board/components/BoardColumn/BoardColumn.vue'
import BoardScrollMap from '~/sections/boards/board/components/BoardScrollMap/BoardScrollMap.vue'
import type { IssueDialogSavedIssue } from '~/sections/boards/board/components/IssueDialog/IssueDialog.vue'
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
  spaceKey: string
}>()

const IssueDialog = defineAsyncComponent(
  () =>
    import('~/sections/boards/board/components/IssueDialog/IssueDialog.vue'),
)
const organizationRoutes = useOrganizationRoutes()
const board = ref<HTMLElement | null>(null)
const dragging = ref(false)
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

const route = useRoute('organizations-organizationKey-spaces-spaceKey-boardId')
const search = computed(() =>
  typeof route.query.search === 'string' ? route.query.search : '',
)
const attributeQuery = computed(() => readIssueAttributeQuery(route.query))
const moveError = ref<null | string>(null)
const movingIssueKeys = ref<Set<string>>(new Set())
const loadingColumnIds = ref<Set<string>>(new Set())
const loadMoreErrors = ref<Map<string, string>>(new Map())
const router = useRouter()

const {
  actionResult: outcome,
  refresh,
  state: pageState,
} = await useActionData({
  action: () =>
    props.deps.viewBoardPage({
      attributeQuery: attributeQuery.value,
      boardId: props.boardId,
      search: search.value,
    }),
  fallbackMessage: 'Could not load the board.',
  key: () => dataKeys.board.view(props.boardId),
  messages: {
    AccessDenied: 'You do not have access to this board.',
    BoardNotFound: 'The board was not found or is not available to you.',
    TemporarilyUnavailable:
      'Could not load the board. The service is temporarily unavailable.',
  },
  watch: [() => props.boardId],
})

const viewModel = computed(() => {
  return pageState.value.type === 'ready' ? pageState.value.data : undefined
})
const issueAttributes = computed(
  () => viewModel.value?.BoardPage.attributes ?? [],
)
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
  void router.replace({
    query: withIssueAttributeFilters(
      route.query,
      value.attributes,
      issueAttributes.value,
    ),
  })
}

function updateSearch(value: string) {
  const query = { ...route.query }
  if (value) {
    query.search = value
  } else {
    delete query.search
  }
  void router.replace({ query })
}

function openIssue(issueKey: string) {
  void router.push({ query: { ...route.query, issue: issueKey } })
}

useHead({
  title: computed(() => viewModel.value?.BoardPage.title ?? 'Board'),
})
const closingIssueDialog = ref(false)
const runSearch = createLatestRequest()
const filtering = ref(false)
const scheduleSearch = debounce(searchIssues, 300)

watch([search, filterKey], () => {
  filtering.value = true
  scheduleSearch()
})
onScopeDispose(scheduleSearch.cancel)

watch(
  () => props.issueKey,
  () => {
    closingIssueDialog.value = false
  },
)

watch(
  () => props.boardId,
  () => {
    scheduleSearch.cancel()
    runSearch.cancel()
    filtering.value = false
    loadingColumnIds.value.clear()
    loadMoreErrors.value.clear()
  },
)

function closeIssueDialog() {
  closingIssueDialog.value = true
  const backState = window.history.state?.back
  const historyBackPath =
    typeof backState === 'string' ? (backState.split('?')[0] ?? null) : null
  const target = resolveIssueDialogCloseTarget({
    currentPath: route.path,
    currentQuery: route.query as Record<string, string>,
    historyBackPath,
  })
  if (target.type === 'back') {
    router.back()
    return
  }
  void navigateTo({ path: route.path, query: target.query }, { replace: true })
}

function handleIssueSaved(issue: IssueDialogSavedIssue) {
  scheduleSearch.cancel()
  runSearch.cancel()
  filtering.value = false
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
  invalidateData({
    preserve: [dataKeys.board.view(props.boardId)],
    scope: 'issues',
  })
  void refreshLoadedIssues(affectedColumnIds)
}

function handleIssueDeleted(issueKey: string) {
  scheduleSearch.cancel()
  runSearch.cancel()
  filtering.value = false
  const current = viewModel.value
  if (current) {
    outcome.value = {
      ok: true,
      value: {
        BoardPage: removeIssueFromBoard(current.BoardPage, issueKey),
      },
    }
  }
  invalidateData({
    preserve: [dataKeys.board.view(props.boardId)],
    scope: 'issues',
  })
}

async function searchIssues() {
  scheduleSearch.cancel()
  filtering.value = true
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
  filtering.value = false
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
        result: current,
      })
    },
    result,
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
    matchActionResult({
      err: (error) => {
        loadMoreErrors.value.set(
          response.columnId,
          getErrorMessage({
            error,
            messages: {
              AccessDenied: 'You do not have permission to view these issues.',
              TemporarilyUnavailable: 'Could not refresh this column.',
            },
          }),
        )
      },
      ok: (value) => {
        loadMoreErrors.value.delete(response.columnId)
        refreshedColumns.set(response.columnId, value)
      },
      result: response.result,
    })
  }

  let refreshedSummary: SearchBoardIssuesResult | undefined
  matchActionResult({
    err: () => undefined,
    ok: (value) => (refreshedSummary = value),
    result: result.summary,
  })

  const latest = viewModel.value
  if (!latest) {
    return
  }
  outcome.value = {
    ok: true,
    value: {
      BoardPage: mergeRefreshedBoard(
        latest.BoardPage,
        refreshedColumns,
        refreshedSummary,
      ),
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
    movingIssueKeys.value.has(input.issueKey)
  ) {
    return
  }

  scheduleSearch.cancel()
  runSearch.cancel()
  filtering.value = false
  moveError.value = null
  movingIssueKeys.value.add(input.issueKey)
  outcome.value = {
    ok: true,
    value: {
      BoardPage: moveIssueInBoard(
        current.BoardPage,
        input.issueKey,
        input.statusId,
      ),
    },
  }
  const result = await props.deps.moveBoardIssue(input)
  matchActionResult({
    err: (error) => {
      const optimistic = viewModel.value
      if (optimistic) {
        outcome.value = {
          ok: true,
          value: {
            BoardPage: moveIssueInBoard(
              optimistic.BoardPage,
              input.issueKey,
              sourceColumn.id,
            ),
          },
        }
      }
      moveError.value = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have permission to move this issue.',
          InvalidStatus: 'This issue cannot be moved to that column.',
          ResourceNotFound: 'The issue or destination column no longer exists.',
          TemporarilyUnavailable: 'Could not move the issue. Try again.',
        },
      })
    },
    ok: () => {
      invalidateData({
        preserve: [dataKeys.board.view(props.boardId)],
        scope: 'issues',
      })
    },
    result,
  })
  movingIssueKeys.value.delete(input.issueKey)
}

async function moveToBacklog(issueKey: string) {
  const current = viewModel.value
  const sourceColumn = current?.BoardPage.columns.find((column) =>
    column.issues.some((issue) => issue.issueKey === issueKey),
  )
  if (!current || !sourceColumn || movingIssueKeys.value.has(issueKey)) {
    return
  }

  scheduleSearch.cancel()
  runSearch.cancel()
  filtering.value = false
  moveError.value = null
  movingIssueKeys.value.add(issueKey)
  outcome.value = {
    ok: true,
    value: {
      BoardPage: removeIssueFromBoard(current.BoardPage, issueKey),
    },
  }
  const result = await props.deps.moveIssueToBacklog({
    boardId: props.boardId,
    issueKey,
    spaceKey: props.spaceKey,
  })
  matchActionResult({
    err: (error) => {
      const optimistic = viewModel.value
      if (optimistic) {
        outcome.value = { ok: true, value: { BoardPage: current.BoardPage } }
      }
      moveError.value = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have permission to move this issue.',
          AlreadyInBacklog: 'This issue is already in the backlog.',
          ResourceNotFound: 'The issue or backlog board no longer exists.',
          TemporarilyUnavailable:
            'Could not move the issue to the backlog. Try again.',
        },
      })
    },
    ok: () => {
      invalidateData({
        preserve: [dataKeys.board.view(props.boardId)],
        scope: 'issues',
      })
    },
    result,
  })
  movingIssueKeys.value.delete(issueKey)
}

async function loadMoreIssues(statusId: string) {
  const current = viewModel.value
  const column = current?.BoardPage.columns.find((c) => c.id === statusId)
  if (
    !current ||
    !column ||
    !column.hasNext ||
    loadingColumnIds.value.has(statusId)
  ) {
    return
  }

  loadingColumnIds.value.add(statusId)
  loadMoreErrors.value.delete(statusId)
  const requestedSearch = search.value
  const requestedFilterKey = filterKey.value

  const result = await props.deps.loadMoreBoardIssues({
    filters: filterInput.value,
    offset: column.issues.length,
    search: requestedSearch,
    statusId,
    take: LOAD_MORE_TAKE,
  })

  loadingColumnIds.value.delete(statusId)

  if (
    search.value !== requestedSearch ||
    filterKey.value !== requestedFilterKey
  ) {
    return
  }
  matchActionResult({
    err: (error) => {
      loadMoreErrors.value.set(
        statusId,
        getErrorMessage({
          error,
          messages: {
            AccessDenied: 'You do not have permission to view these issues.',
            TemporarilyUnavailable:
              'Could not load more issues. Scroll to retry.',
          },
        }),
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
    result,
  })
}

function removeIssueFromBoard(
  board: BoardPageViewModel,
  issueKey: string,
): BoardPageViewModel {
  const source = board.columns.find((column) =>
    column.issues.some((issue) => issue.issueKey === issueKey),
  )
  if (!source) {
    return board
  }

  return {
    ...board,
    columns: board.columns.map((column) =>
      column === source
        ? {
            ...column,
            issueCount: column.issueCount - 1,
            issues: column.issues.filter((item) => item.issueKey !== issueKey),
          }
        : column,
    ),
    issueCount: Math.max(0, board.issueCount - 1),
  }
}

function moveIssueInBoard(
  board: BoardPageViewModel,
  issueKey: string,
  statusId: string,
): BoardPageViewModel {
  const source = board.columns.find((column) =>
    column.issues.some((issue) => issue.issueKey === issueKey),
  )
  const target = board.columns.find((column) => column.id === statusId)
  const issue = source?.issues.find((item) => item.issueKey === issueKey)
  if (!source || !target || !issue || source === target) {
    return board
  }

  return {
    ...board,
    columns: board.columns.map((column) => {
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
  board: BoardPageViewModel,
  update: IssueDialogSavedIssue,
): BoardPageViewModel {
  const hasIssue = board.columns.some((column) =>
    column.issues.some((issue) => issue.issueKey === update.issueKey),
  )
  if (!hasIssue) {
    return board
  }
  if (update.boardId !== board.id) {
    return removeIssueFromBoard(board, update.issueKey)
  }

  const updated = moveIssueInBoard(board, update.issueKey, update.statusId)
  return {
    ...updated,
    columns: updated.columns.map((column) => ({
      ...column,
      issues: column.issues.map((issue) =>
        issue.issueKey === update.issueKey
          ? { ...issue, content: update.content }
          : issue,
      ),
    })),
  }
}

function handleDragEnd(event: DragEndEvent) {
  dragging.value = false
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
  const query = { ...input.currentQuery }
  delete query.issue
  return { query, type: 'replace' as const }
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
