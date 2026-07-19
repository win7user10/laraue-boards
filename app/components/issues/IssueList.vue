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
      :key="issue.id"
      :assignee="issue.assignee"
      :assignee-color="issue.assigneeColor"
      :assignee-initial="issue.assigneeInitial"
      :board-color="issue.boardColor"
      :board-name="issue.boardName"
      :can-move="issue.canMove"
      :content="issue.content"
      :issue-key="issue.key"
      :selected="selected.has(issue.id)"
      :space-color="issue.spaceColor"
      :space-name="issue.spaceName"
      :status="issue.status"
      :status-color="issue.statusColor"
      :to="organizationRoutes.issue(issue.id)"
      @move="openMoveDialog([issue.id])"
      @toggle-selection="toggleSelection(issue.id)" />
    <p
      v-if="issues.length === 0"
      class="empty">
      {{ emptyText }}
    </p>
  </div>
  <PaginationControl
    :has-next-page="hasNextPage"
    :page="page"
    @update:page="emit('updatePage', $event)" />
  <MoveIssuesDialog
    ref="moveDialog"
    :boards="moveBoards"
    :error="moveError"
    :loading-boards="loadingMoveBoards"
    :loading-spaces="loadingMoveSpaces"
    :loading-statuses="loadingMoveStatuses"
    :moving="moving"
    :spaces="moveSpaces"
    :statuses="moveStatuses"
    @change-board="emit('changeMoveBoard')"
    @change-space="emit('changeMoveSpace')"
    @load-boards="emit('loadMoveBoards', $event)"
    @load-spaces="emit('loadMoveSpaces')"
    @load-statuses="emit('loadMoveStatuses', $event)"
    @move="emit('moveIssues', $event)"
    @moved="selected.clear()" />
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
  id: string
  key: string
  spaceColor?: string
  spaceName?: string
  status: string
  statusColor: string
}

export type IssueListProps = {
  emptyText: string
  filtering: boolean
  hasNextPage: boolean
  issues: IssueListItemViewModel[]
  loadingMoveBoards: boolean
  loadingMoveSpaces: boolean
  loadingMoveStatuses: boolean
  moveBoards: Array<{ label: string; value: string }>
  moveError: null | string
  moveSpaces: Array<{ label: string; value: string }>
  moveStatuses: Array<{ id: string; name: string }>
  moving: boolean
  page: number
}
</script>

<script setup lang="ts">
import { ArrowRightLeft } from 'lucide-vue-next'

import IssueListRow from './IssueListRow.vue'
import MoveIssuesDialog from './MoveIssuesDialog.vue'

defineProps<IssueListProps>()
const emit = defineEmits<{
  changeMoveBoard: []
  changeMoveSpace: []
  loadMoveBoards: [spaceId: string]
  loadMoveSpaces: []
  loadMoveStatuses: [boardId: string]
  moveIssues: [input: { issueIds: string[]; statusId: string }]
  updatePage: [value: number]
}>()

const organizationRoutes = useOrganizationRoutes()
const selected = ref(new Set<string>())
const moveDialog = ref<{ open: (ids: string[]) => void }>()

function toggleSelection(id: string) {
  if (selected.value.has(id)) {
    selected.value.delete(id)
  } else {
    selected.value.add(id)
  }
}

function openMoveDialog(ids: string[]) {
  moveDialog.value?.open(ids)
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
