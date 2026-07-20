<template>
  <Transition name="slide-fade">
    <div
      v-if="selected.size"
      class="bulk-bar">
      <span>{{ selected.size }} selected</span>
      <div class="bulk-actions">
        <button
          class="secondary"
          type="button"
          @click="selected.clear()">
          Clear
        </button>
        <button
          class="primary"
          type="button"
          @click="openMoveDialog([...selected])">
          <ArrowRightLeft />
          Move to board
        </button>
      </div>
    </div>
  </Transition>
  <div
    :aria-busy="filtering"
    class="issue-list"
    :class="{ 'results-stale': filtering }">
    <IssueListRow
      v-for="issue in issues"
      :key="issue.issueKey"
      :assignee="issue.assignee"
      :assignee-color="issue.assigneeColor"
      :assignee-initial="issue.assigneeInitial"
      :board-color="issue.boardColor"
      :board-name="issue.boardName"
      :can-move="issue.canMove"
      :content="issue.content"
      :issue-key="issue.issueKey"
      :on-move="() => openMoveDialog([issue.issueKey])"
      :on-toggle-selection="() => toggleSelection(issue.issueKey)"
      :selected="selected.has(issue.issueKey)"
      :space-color="issue.spaceColor"
      :space-name="issue.spaceName"
      :status="issue.status"
      :status-color="issue.statusColor"
      :to="organizationRoutes.issue(issue.issueKey)" />
    <p
      v-if="issues.length === 0"
      class="empty">
      {{ emptyText }}
    </p>
  </div>
  <PaginationControl
    :has-next-page="hasNextPage"
    :page="page"
    @update:page="props.onUpdatePage" />
  <MoveIssuesDialog
    ref="moveDialog"
    :boards="state.boards"
    :error="state.error"
    :loading-boards="state.loadingBoards"
    :loading-spaces="state.loadingSpaces"
    :loading-statuses="state.loadingStatuses"
    :moving="state.moving"
    :on-change-board="changeBoard"
    :on-change-space="changeSpace"
    :on-load-boards="loadBoards"
    :on-load-spaces="loadSpaces"
    :on-load-statuses="loadStatuses"
    :on-move="moveIssues"
    :spaces="state.spaces"
    :statuses="state.statuses" />
</template>

<script lang="ts">
export type IssueListItemViewModel = {
  assignee: string
  assigneeColor: string
  assigneeInitial: string
  boardColor: string
  boardName: string
  canMove: boolean
  content: string
  issueKey: string
  spaceColor?: string
  spaceName?: string
  status: string
  statusColor: string
}

export type IssueListProps = {
  deps: IssueListDeps
  emptyText: string
  filtering: boolean
  hasNextPage: boolean
  issues: IssueListItemViewModel[]
  onMoved: () => Promise<void> | void
  onUpdatePage: (value: number) => void
  page: number
  sourceBoardId: null | string
}
</script>

<script setup lang="ts">
import { ArrowRightLeft } from 'lucide-vue-next'

import IssueListRow from '~/components/issues/issue-list/components/IssueListRow.vue'
import MoveIssuesDialog from '~/components/issues/issue-list/components/MoveIssuesDialog.vue'
import type { IssueListDeps } from '~/components/issues/issue-list/IssueListDeps'

const props = defineProps<IssueListProps>()

const organizationRoutes = useOrganizationRoutes()
const selected = ref(new Set<string>())
const moveDialog = ref<{ open: (ids: string[]) => void }>()
const state = reactive({
  boards: [] as Array<{ label: string; value: string }>,
  error: null as null | string,
  loadingBoards: false,
  loadingSpaces: false,
  loadingStatuses: false,
  moving: false,
  spaces: [] as Array<{ label: string; value: string }>,
  statuses: [] as Array<{ id: string; name: string }>,
})

function toggleSelection(issueKey: string) {
  if (selected.value.has(issueKey)) {
    selected.value.delete(issueKey)
  } else {
    selected.value.add(issueKey)
  }
}

function openMoveDialog(ids: string[]) {
  moveDialog.value?.open(ids)
}

function changeSpace() {
  state.loadingBoards = false
  state.loadingStatuses = false
  state.error = null
  state.boards = []
  state.statuses = []
}

function changeBoard() {
  state.loadingStatuses = false
  state.error = null
  state.statuses = []
}

async function loadSpaces() {
  state.error = null
  state.loadingSpaces = true
  const result = await props.deps.loadMoveSpaces()
  state.loadingSpaces = false
  matchActionResult({
    err: (error) => {
      state.error = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have access to available spaces.',
          TemporarilyUnavailable: 'Could not load available spaces.',
        },
      })
    },
    ok: (value) => {
      state.spaces = value.spaces
    },
    result,
  })
}

async function loadBoards(spaceId: string) {
  state.error = null
  state.loadingBoards = true
  const result = await props.deps.loadMoveBoards({
    sourceBoardId: props.sourceBoardId,
    spaceId,
  })
  state.loadingBoards = false
  matchActionResult({
    err: (error) => {
      state.error = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have access to this space.',
          SpaceNotFound: 'This space no longer exists.',
          TemporarilyUnavailable: 'Could not load space boards.',
        },
      })
    },
    ok: (value) => {
      state.boards = value.boards
    },
    result,
  })
}

async function loadStatuses(boardId: string) {
  state.error = null
  state.statuses = []
  state.loadingStatuses = true
  const result = await props.deps.loadMoveStatuses({ boardId })
  state.loadingStatuses = false
  matchActionResult({
    err: (error) => {
      state.error = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have access to this board.',
          BoardNotFound: 'This board no longer exists.',
          TemporarilyUnavailable: 'Could not load board columns.',
        },
      })
    },
    ok: (value) => {
      state.statuses = value.statuses
    },
    result,
  })
}

async function moveIssues(input: { issueKeys: string[]; statusId: string }) {
  state.error = null
  state.moving = true
  const result = await props.deps.moveIssues(input)
  await matchActionResult({
    err: async (error) => {
      state.error = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have permission to move some issues.',
          InvalidStatus: 'Select a valid board column.',
          ResourceNotFound: 'An issue or board column was not found.',
          TemporarilyUnavailable: 'Could not move some issues. Try again.',
        },
      })
    },
    ok: async () => {
      await props.onMoved()
      selected.value.clear()
    },
    result,
  })
  state.moving = false
}
</script>

<style scoped>
.issue-list {
  background: transparent;
  display: grid;
  gap: var(--space-2);
  margin-top: var(--space-4);
}

.bulk-bar {
  align-items: center;
  background: var(--color-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  display: flex;
  gap: var(--space-3);
  justify-content: space-between;
  margin-top: var(--space-2);
  padding: var(--space-2) var(--space-4);
}

.bulk-actions {
  display: flex;
  gap: var(--space-2);
}
</style>
