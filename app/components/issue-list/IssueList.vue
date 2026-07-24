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
    :deps="deps.moveIssuesDialog"
    :excluded-board-id="excludedMoveBoardId"
    :on-moved="handleMoved" />
</template>

<script setup lang="ts">
import IssueListRow from '~/components/issue-list/components/IssueListRow.vue'
import MoveIssuesDialog from '~/components/issue-list/components/move-issues-dialog/MoveIssuesDialog.vue'
import type { IssueListDeps } from '~/components/issue-list/deps'

import type { IssueListItem } from './IssueList.types'

const props = defineProps<{
  deps: IssueListDeps
  emptyText: string
  excludedMoveBoardId?: string
  filtering: boolean
  hasNextPage: boolean
  issues: IssueListItem[]
  onMoved: () => Promise<void> | void
  onUpdatePage: (value: number) => void
  page: number
}>()

const organizationRoutes = useOrganizationRoutes()
const moveDialog = ref<{ open: (ids: string[]) => void }>()
const state = reactive({
  selected: new Set<string>(),
})
const selected = computed(() => state.selected)

const toggleSelection = (issueKey: string) => {
  if (selected.value.has(issueKey)) {
    selected.value.delete(issueKey)
  } else {
    selected.value.add(issueKey)
  }
}

const openMoveDialog = (ids: string[]) => {
  moveDialog.value?.open(ids)
}

const handleMoved = async () => {
  selected.value.clear()
  await props.onMoved()
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
