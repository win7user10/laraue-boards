<template>
  <AppBulkBar
    action-label="Move to board"
    :count="selected.size"
    @action="openMoveDialog([...selected])"
    @clear="selected.clear()" />
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
    :boards="move.boards"
    :error="move.error"
    :loading-boards="move.loadingBoards"
    :loading-spaces="move.loadingSpaces"
    :loading-statuses="move.loadingStatuses"
    :moving="move.moving"
    :on-change-board="props.onChangeMoveBoard"
    :on-change-space="props.onChangeMoveSpace"
    :on-load-boards="props.onLoadMoveBoards"
    :on-load-spaces="props.onLoadMoveSpaces"
    :on-load-statuses="props.onLoadMoveStatuses"
    :on-move="moveIssues"
    :spaces="move.spaces"
    :statuses="move.statuses" />
</template>

<script lang="ts">
type IssueListItemViewModel = {
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

type IssueListProps = {
  emptyText: string
  filtering: boolean
  hasNextPage: boolean
  issues: IssueListItemViewModel[]
  move: IssueListMoveState
  onChangeMoveBoard: () => void
  onChangeMoveSpace: () => void
  onLoadMoveBoards: (spaceId: string) => Promise<void> | void
  onLoadMoveSpaces: () => Promise<void> | void
  onLoadMoveStatuses: (boardId: string) => Promise<void> | void
  onMove: (input: { issueKeys: string[]; statusId: string }) => Promise<boolean>
  onUpdatePage: (value: number) => void
  page: number
}

type IssueListMoveState = {
  boards: Array<{ label: string; value: string }>
  error: null | string
  loadingBoards: boolean
  loadingSpaces: boolean
  loadingStatuses: boolean
  moving: boolean
  spaces: Array<{ label: string; value: string }>
  statuses: Array<{ id: string; name: string }>
}
</script>

<script setup lang="ts">
import IssueListRow from '~/components/issue-list/components/IssueListRow.vue'
import MoveIssuesDialog from '~/components/issue-list/components/MoveIssuesDialog.vue'

const props = defineProps<IssueListProps>()

const organizationRoutes = useOrganizationRoutes()
const moveDialog = ref<{ open: (ids: string[]) => void }>()
const state = reactive({
  selected: new Set<string>(),
})
const selected = computed(() => state.selected)

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

async function moveIssues(input: { issueKeys: string[]; statusId: string }) {
  if (await props.onMove(input)) {
    selected.value.clear()
  }
}
</script>

<style scoped>
.issue-list {
  background: transparent;
  display: grid;
  gap: var(--space-2);
  margin-top: var(--space-4);
}
</style>
