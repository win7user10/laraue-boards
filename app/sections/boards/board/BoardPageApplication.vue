<template>
  <BoardPage
    v-if="pageState.type === 'ready'"
    :filter-value="filterValue"
    :filtering="filtering"
    :issue-assignees="issueAssignees"
    :issue-dialog-visible="Boolean(issueId) && !closingIssueDialog"
    :issue-error="issueError"
    :issue-load-error-text="issueLoadErrorText"
    :issue-loading="issueStatus === 'idle' || issueStatus === 'pending'"
    :issue-loading-assignees="loadingIssueAssignees"
    :issue-loading-move-boards="loadingIssueMoveBoards"
    :issue-loading-move-spaces="loadingIssueMoveSpaces"
    :issue-loading-statuses="loadingIssueStatuses"
    :issue-move-boards="issueMoveBoards"
    :issue-move-spaces="issueMoveSpaces"
    :issue-saving="savingIssue"
    :issue-statuses="issueStatuses"
    :issue-view-model="issueData?.IssueDialog ?? null"
    :load-more-errors="loadMoreErrors"
    :loading-column-ids="loadingColumnIds"
    :move-error="moveError"
    :moving-issue-ids="movingIssueIds"
    :search="search"
    :space-key="spaceKey"
    :view-model="pageState.data.BoardPage"
    @change-issue-board="changeIssueBoard"
    @change-issue-move-space="changeIssueMoveSpace"
    @close-issue="closeIssueDialog"
    @delete-issue="removeIssue"
    @load-issue-assignees="loadIssueAssignees"
    @load-issue-move-boards="loadIssueMoveBoards"
    @load-issue-move-spaces="loadIssueMoveSpaces"
    @load-issue-statuses="loadIssueStatuses"
    @load-more="loadMoreIssues"
    @move-issue="moveIssue"
    @move-to-backlog="moveToBacklog"
    @open-issue="openIssue"
    @retry-issue="refreshIssue()"
    @save-issue="saveIssue"
    @update-filters="updateFilters"
    @update-search="updateSearch" />
  <PageLoadState
    v-else
    :error-text="pageState.type === 'error' ? pageState.message : ''"
    :loading="pageState.type === 'pending'"
    loading-text="Loading board…"
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
import { getIssueAttributeValueInput } from '../../../utils/issueAttributeValues'
import type { BoardPageApplicationDeps } from './BoardPageApplicationDeps'
import type {
  BoardPageFilterValue,
  BoardPageViewModel,
} from './view/BoardPage.vue'
import BoardPage from './view/BoardPage.vue'

const props = defineProps<{
  boardId: string
  deps: BoardPageApplicationDeps
  issueId: null | string
  spaceKey: string
}>()

const LOAD_MORE_TAKE = 25

const route = useRoute('organizations-organizationKey-spaces-spaceKey-boardId')
const search = computed(() =>
  typeof route.query.search === 'string' ? route.query.search : '',
)
const attributeQuery = computed(() => readIssueAttributeQuery(route.query))
const moveError = ref<null | string>(null)
const movingIssueIds = ref<Set<string>>(new Set())
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
  key: () => asyncDataKeys.board.view(props.boardId),
  messages: {
    AccessDenied: 'You do not have access to this board.',
    BoardNotFound: 'The board was not found or is not available to you.',
    TemporarilyUnavailable:
      'Could not load the board. The service is temporarily unavailable.',
  },
  watch: [() => props.boardId],
})

const {
  data: issueOutcome,
  refresh: refreshIssue,
  status: issueStatus,
} = await useLazyAsyncData(
  () => asyncDataKeys.issue.dialog(props.issueId ?? 'closed'),
  loadIssueDialog,
  { server: false },
)

type LoadIssueDialogOutcome = Awaited<
  ReturnType<BoardPageApplicationDeps['loadIssueDialog']>
>
type IssueDialogData =
  LoadIssueDialogOutcome extends ActionResult<infer Value, PropertyKey>
    ? Value
    : never
type IssueDialogError =
  LoadIssueDialogOutcome extends ActionResult<unknown, infer Error>
    ? Error
    : never
type IssueDialogOutcome = ActionResult<
  IssueDialogData | undefined,
  IssueDialogError
>

async function loadIssueDialog(): Promise<IssueDialogOutcome> {
  return props.issueId
    ? props.deps.loadIssueDialog({ issueId: props.issueId })
    : { ok: true, value: undefined }
}

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

function openIssue(issueId: string) {
  void router.push({ query: { ...route.query, issue: issueId } })
}

const issueData = computed(() => {
  const value = issueOutcome.value
  if (!value) {
    return undefined
  }
  return matchActionResult({
    err: () => undefined,
    ok: (data) => data,
    result: value,
  })
})
useHead({
  title: computed(
    () =>
      issueData.value?.IssueDialog?.issueKey ??
      viewModel.value?.BoardPage.title ??
      'Board',
  ),
})
const issueLoadErrorText = computed(() => {
  const value = issueOutcome.value
  if (!value) {
    return 'Could not load issue. Try again.'
  }
  return matchActionResult({
    err: (error) =>
      getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have access to this issue.',
          IssueNotFound: 'The issue was not found or is not available to you.',
          TemporarilyUnavailable:
            'Could not load issue. The service is temporarily unavailable.',
        },
      }),
    ok: () => 'Could not load issue. Try again.',
    result: value,
  })
})
const savingIssue = ref(false)
const closingIssueDialog = ref(false)
const loadingIssueStatuses = ref(false)
const issueStatuses = ref<Array<{ id: string; name: string }>>([])
const issueError = ref<null | string>(null)
const loadingIssueAssignees = ref(false)
const issueAssignees = ref<Array<{ label: string; value: string }>>([])
const loadingIssueMoveSpaces = ref(false)
const loadingIssueMoveBoards = ref(false)
const issueMoveSpaces = ref<Array<{ label: string; value: string }>>([])
const issueMoveBoards = ref<Array<{ label: string; value: string }>>([])
const invalidation = useAsyncDataInvalidation()
const runSearch = createLatestRequest()
const runLoadIssueAssignees = createLatestRequest()
const filtering = ref(false)
const scheduleSearch = debounce(searchIssues, 300)

watch([search, filterKey], () => {
  filtering.value = true
  scheduleSearch()
})
onScopeDispose(scheduleSearch.cancel)

watch(
  () => props.issueId,
  () => {
    runLoadIssueAssignees.cancel()
    closingIssueDialog.value = false
    issueError.value = null
    issueStatuses.value = []
    issueAssignees.value = []
    issueMoveSpaces.value = []
    issueMoveBoards.value = []
    loadingIssueMoveSpaces.value = false
    loadingIssueMoveBoards.value = false
    loadingIssueStatuses.value = false
    loadingIssueAssignees.value = false
  },
)

async function loadIssueAssignees(spaceId: string) {
  if (!spaceId || loadingIssueAssignees.value || issueAssignees.value.length) {
    return
  }
  issueError.value = null
  loadingIssueAssignees.value = true
  const result = await runLoadIssueAssignees({
    request: () => props.deps.loadIssueDialogAssignees({ spaceId }),
  })
  if (!result) {
    return
  }
  loadingIssueAssignees.value = false
  matchActionResult({
    err: (error) => {
      issueError.value = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have access to space members.',
          SpaceNotFound: 'The selected space was not found.',
          TemporarilyUnavailable: 'Could not load assignees. Try again.',
        },
      })
    },
    ok: (value) => {
      issueAssignees.value = value.assignees
    },
    result,
  })
}

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

async function loadIssueMoveSpaces() {
  issueError.value = null
  issueMoveSpaces.value = []
  loadingIssueMoveSpaces.value = true
  const result = await props.deps.loadIssueMoveSpaces()
  loadingIssueMoveSpaces.value = false
  matchActionResult({
    err: (error) => {
      issueError.value = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have access to available spaces.',
          TemporarilyUnavailable: 'Could not load available spaces.',
        },
      })
    },
    ok: (value) => {
      issueMoveSpaces.value = value.spaces
    },
    result,
  })
}

function changeIssueMoveSpace() {
  runLoadIssueAssignees.cancel()
  issueAssignees.value = []
  loadingIssueAssignees.value = false
  loadingIssueMoveBoards.value = false
  loadingIssueStatuses.value = false
  issueError.value = null
  issueMoveBoards.value = []
  issueStatuses.value = []
}

async function loadIssueMoveBoards(spaceId: string) {
  issueError.value = null
  loadingIssueMoveBoards.value = true
  const result = await props.deps.loadIssueMoveBoards({ spaceId })
  loadingIssueMoveBoards.value = false
  matchActionResult({
    err: (error) => {
      issueError.value = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have access to this space.',
          SpaceNotFound: 'This space no longer exists.',
          TemporarilyUnavailable: 'Could not load space boards.',
        },
      })
    },
    ok: (value) => {
      issueMoveBoards.value = value.boards
    },
    result,
  })
}

function changeIssueBoard() {
  loadingIssueStatuses.value = false
  issueStatuses.value = []
  issueError.value = null
}

async function loadIssueStatuses(boardId: string) {
  loadingIssueStatuses.value = true
  issueError.value = null
  const result = await props.deps.loadIssueStatuses({ boardId })
  matchActionResult({
    err: (error) => {
      issueStatuses.value = []
      issueError.value = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have access to this board.',
          BoardNotFound: 'This board no longer exists.',
          TemporarilyUnavailable: 'Could not load board statuses.',
        },
      })
    },
    ok: (value) => {
      issueStatuses.value = value.statuses
    },
    result,
  })
  loadingIssueStatuses.value = false
}

async function saveIssue(input: {
  assigneeId: string
  attributeValues: Record<string, string>
  boardId: string
  content: string
  statusId: string
}) {
  const issueId = props.issueId
  const originalIssue = issueData.value?.IssueDialog
  if (!issueId || !originalIssue) {
    return
  }
  scheduleSearch.cancel()
  runSearch.cancel()
  filtering.value = false
  savingIssue.value = true
  issueError.value = null
  const updateResult = await props.deps.updateIssue({
    assigneeId: input.assigneeId,
    attributeValues: getIssueAttributeValueInput(
      input.attributeValues,
      originalIssue.attributes,
    ),
    content: input.content,
    issueId,
  })
  const updateBoardIssue = (boardId: string, statusId: string) => {
    const current = viewModel.value
    if (current) {
      outcome.value = {
        ok: true,
        value: {
          BoardPage: updateIssueInBoard(current.BoardPage, {
            boardId,
            content: input.content,
            issueId,
            statusId,
          }),
        },
      }
    }
  }
  await matchActionResult({
    err: async (updateError) => {
      issueError.value = getErrorMessage({
        error: updateError,
        messages: {
          AccessDenied: 'You do not have permission to update this issue.',
          IssueNotFound: 'The issue was not found.',
          TemporarilyUnavailable: 'Could not save issue. Try again.',
        },
      })
    },
    ok: async () => {
      invalidation.invalidateIssueDataExceptBoard(issueId, props.boardId)
      if (input.statusId === originalIssue?.statusId) {
        updateBoardIssue(input.boardId, input.statusId)
        closeIssueDialog()
        void searchIssues()
        return
      }
      const moveResult = await props.deps.moveBoardIssue({
        issueId,
        statusId: input.statusId,
      })
      await matchActionResult({
        err: async (moveError) => {
          if (originalIssue) {
            updateBoardIssue(originalIssue.boardId, originalIssue.statusId)
            await refreshIssue()
          }
          issueError.value = getErrorMessage({
            error: moveError,
            messages: {
              AccessDenied: 'You do not have permission to update this issue.',
              InvalidStatus: 'Select a valid board status.',
              ResourceNotFound: 'The issue or board status was not found.',
              TemporarilyUnavailable: 'Could not save issue. Try again.',
            },
          })
        },
        ok: async () => {
          updateBoardIssue(input.boardId, input.statusId)
          closeIssueDialog()
          void searchIssues()
        },
        result: moveResult,
      })
    },
    result: updateResult,
  })
  savingIssue.value = false
}

async function removeIssue() {
  const issueId = props.issueId
  if (!issueId || !confirm('Delete this issue?')) {
    return
  }
  scheduleSearch.cancel()
  runSearch.cancel()
  filtering.value = false
  const result = await props.deps.deleteIssue({ issueId })
  matchActionResult({
    err: (actionError) => {
      issueError.value = getErrorMessage({
        error: actionError,
        messages: {
          AccessDenied: 'You do not have permission to delete this issue.',
          IssueNotFound: 'This issue no longer exists.',
          TemporarilyUnavailable: 'Could not delete issue. Try again.',
        },
      })
    },
    ok: () => {
      const current = viewModel.value
      if (current) {
        outcome.value = {
          ok: true,
          value: {
            BoardPage: removeIssueFromBoard(current.BoardPage, issueId),
          },
        }
      }
      closeIssueDialog()
      invalidation.invalidateIssueDataExceptBoard(issueId, props.boardId)
    },
    result,
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

async function moveIssue(input: { issueId: string; statusId: string }) {
  const current = viewModel.value
  const sourceColumn = current?.BoardPage.columns.find((column) =>
    column.issues.some((issue) => issue.id === input.issueId),
  )
  if (
    !current ||
    !sourceColumn ||
    sourceColumn.id === input.statusId ||
    movingIssueIds.value.has(input.issueId)
  ) {
    return
  }

  scheduleSearch.cancel()
  runSearch.cancel()
  filtering.value = false
  moveError.value = null
  movingIssueIds.value.add(input.issueId)
  outcome.value = {
    ok: true,
    value: {
      BoardPage: moveIssueInBoard(
        current.BoardPage,
        input.issueId,
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
              input.issueId,
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
      invalidation.invalidateIssueDataExceptBoard(input.issueId, props.boardId)
    },
    result,
  })
  movingIssueIds.value.delete(input.issueId)
}

async function moveToBacklog(issueId: string) {
  const current = viewModel.value
  const sourceColumn = current?.BoardPage.columns.find((column) =>
    column.issues.some((issue) => issue.id === issueId),
  )
  if (!current || !sourceColumn || movingIssueIds.value.has(issueId)) {
    return
  }

  scheduleSearch.cancel()
  runSearch.cancel()
  filtering.value = false
  moveError.value = null
  movingIssueIds.value.add(issueId)
  outcome.value = {
    ok: true,
    value: {
      BoardPage: removeIssueFromBoard(current.BoardPage, issueId),
    },
  }
  const result = await props.deps.moveIssueToBacklog({
    boardId: props.boardId,
    issueId,
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
      invalidation.invalidateIssueDataExceptBoard(issueId, props.boardId)
    },
    result,
  })
  movingIssueIds.value.delete(issueId)
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
  issueId: string,
): BoardPageViewModel {
  const source = board.columns.find((column) =>
    column.issues.some((issue) => issue.id === issueId),
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
            issues: column.issues.filter((item) => item.id !== issueId),
          }
        : column,
    ),
    issueCount: Math.max(0, board.issueCount - 1),
  }
}

function moveIssueInBoard(
  board: BoardPageViewModel,
  issueId: string,
  statusId: string,
): BoardPageViewModel {
  const source = board.columns.find((column) =>
    column.issues.some((issue) => issue.id === issueId),
  )
  const target = board.columns.find((column) => column.id === statusId)
  const issue = source?.issues.find((item) => item.id === issueId)
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
  update: {
    boardId: string
    content: string
    issueId: string
    statusId: string
  },
): BoardPageViewModel {
  const hasIssue = board.columns.some((column) =>
    column.issues.some((issue) => issue.id === update.issueId),
  )
  if (!hasIssue) {
    return board
  }
  if (update.boardId !== board.id) {
    return removeIssueFromBoard(board, update.issueId)
  }

  const updated = moveIssueInBoard(board, update.issueId, update.statusId)
  return {
    ...updated,
    columns: updated.columns.map((column) => ({
      ...column,
      issues: column.issues.map((issue) =>
        issue.id === update.issueId
          ? { ...issue, content: update.content }
          : issue,
      ),
    })),
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
