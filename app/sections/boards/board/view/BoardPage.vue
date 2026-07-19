<template>
  <section class="board-content">
    <div class="title-row">
      <div class="page-heading">
        <AppBackLink
          label="Back to space"
          :to="organizationRoutes.space(spaceKey)" />
        <BoardIcon
          class="page-heading-icon"
          :style="{ color: viewModel.color || undefined }" />
        <div class="page-heading-text">
          <h1>{{ viewModel.title }}</h1>
        </div>
      </div>
      <div class="title-actions">
        <NuxtLink
          v-if="viewModel.canUpdate || viewModel.canDelete"
          aria-label="Board settings"
          class="secondary"
          :to="organizationRoutes.boardSettings(spaceKey, viewModel.id)">
          <Settings />
          <span class="btn-label">Settings</span>
        </NuxtLink>
        <NuxtLink
          v-if="viewModel.canCreateIssues"
          class="primary"
          :to="organizationRoutes.newBoardIssue(spaceKey, viewModel.id)">
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
        @input="
          emit('updateSearch', ($event.target as HTMLInputElement).value)
        " />
      <IssueFilters
        :attributes="viewModel.attributes"
        :model-value="filterValue"
        @update:model-value="emit('updateFilters', $event)" />
      <span
        v-if="!filtering"
        class="muted issue-count">
        {{ viewModel.issueCount }} issues
      </span>
      <AppResultsUpdating :loading="filtering" />
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
        :aria-busy="filtering || movingIssueIds.size > 0"
        class="board"
        :class="{
          'board--dragging': dragging,
          'results-stale': filtering,
        }">
        <BoardColumn
          v-for="column in viewModel.columns"
          :key="column.id"
          :can-move-issues="viewModel.canMoveIssues"
          :load-more-error="loadMoreErrors.get(column.id) ?? null"
          :loading-more="loadingColumnIds.has(column.id)"
          :moving-issue-ids="movingIssueIds"
          :view-model="column"
          @load-more="emit('loadMore', column.id)"
          @move-to-backlog="emit('moveToBacklog', $event)"
          @open-issue="emit('openIssue', $event)" />
      </div>
      <BoardScrollMap
        :column-count="viewModel.columns.length"
        :target="board" />
    </DragDropProvider>
    <IssueDialog
      v-if="issueDialogVisible"
      :assignees="issueAssignees"
      :error="issueError"
      :load-error-text="issueLoadErrorText"
      :loading="issueLoading"
      :loading-assignees="issueLoadingAssignees"
      :loading-move-boards="issueLoadingMoveBoards"
      :loading-move-spaces="issueLoadingMoveSpaces"
      :loading-statuses="issueLoadingStatuses"
      :move-boards="issueMoveBoards"
      :move-spaces="issueMoveSpaces"
      :saving="issueSaving"
      :statuses="issueStatuses"
      :view-model="issueViewModel"
      @change-board="emit('changeIssueBoard')"
      @change-move-space="emit('changeIssueMoveSpace', $event)"
      @close="emit('closeIssue')"
      @delete="emit('deleteIssue')"
      @load-assignees="emit('loadIssueAssignees', $event)"
      @load-move-boards="emit('loadIssueMoveBoards', $event)"
      @load-move-spaces="emit('loadIssueMoveSpaces')"
      @load-statuses="emit('loadIssueStatuses', $event)"
      @retry="emit('retryIssue')"
      @save="emit('saveIssue', $event)" />
  </section>
</template>

<script lang="ts">
import type { BoardColumnViewModel } from './components/BoardColumn/BoardColumn.vue'
import type { IssueDialogViewModel } from './components/IssueDialog/IssueDialog.vue'

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
</script>

<script setup lang="ts">
import { defaultPreset, PointerActivationConstraints } from '@dnd-kit/dom'
import { DragDropProvider, KeyboardSensor, PointerSensor } from '@dnd-kit/vue'
import type { DragEndEvent } from '@dnd-kit/vue'
import { Plus, Settings } from 'lucide-vue-next'

import IssueFilters from '~/components/issues/IssueFilters.vue'

import { BoardIcon } from '../../../../constants/icons'
import BoardColumn from './components/BoardColumn/BoardColumn.vue'
import BoardScrollMap from './components/BoardScrollMap/BoardScrollMap.vue'

const props = defineProps<{
  filtering: boolean
  filterValue: BoardPageFilterValue
  issueAssignees: Array<{ label: string; value: string }>
  issueDialogVisible: boolean
  issueError: null | string
  issueLoadErrorText: string
  issueLoading: boolean
  issueLoadingAssignees: boolean
  issueLoadingMoveBoards: boolean
  issueLoadingMoveSpaces: boolean
  issueLoadingStatuses: boolean
  issueMoveBoards: Array<{ label: string; value: string }>
  issueMoveSpaces: Array<{ label: string; value: string }>
  issueSaving: boolean
  issueStatuses: Array<{ id: string; name: string }>
  issueViewModel: IssueDialogViewModel | null
  loadingColumnIds: Set<string>
  loadMoreErrors: Map<string, string>
  moveError: null | string
  movingIssueIds: Set<string>
  search: string
  spaceKey: string
  viewModel: BoardPageViewModel
}>()

const emit = defineEmits<{
  changeIssueBoard: []
  changeIssueMoveSpace: [spaceId: string]
  closeIssue: []
  deleteIssue: []
  loadIssueAssignees: [spaceId: string]
  loadIssueMoveBoards: [spaceId: string]
  loadIssueMoveSpaces: []
  loadIssueStatuses: [boardId: string]
  loadMore: [statusId: string]
  moveIssue: [input: { issueId: string; statusId: string }]
  moveToBacklog: [issueId: string]
  openIssue: [issueId: string]
  retryIssue: []
  saveIssue: [
    input: {
      assigneeId: string
      attributeValues: Record<string, string>
      boardId: string
      content: string
      statusId: string
    },
  ]
  updateFilters: [value: BoardPageFilterValue]
  updateSearch: [value: string]
}>()

const IssueDialog = defineAsyncComponent(
  () => import('./components/IssueDialog/IssueDialog.vue'),
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

function handleDragEnd(event: DragEndEvent) {
  dragging.value = false
  if (event.canceled) {
    return
  }

  const issueId = event.operation.source?.id
  const statusId = event.operation.target?.id
  if (typeof issueId !== 'string' || typeof statusId !== 'string') {
    return
  }

  const sourceColumn = props.viewModel.columns.find((column) =>
    column.issues.some((issue) => issue.id === issueId),
  )
  if (sourceColumn && sourceColumn.id !== statusId) {
    emit('moveIssue', { issueId, statusId })
  }
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
    scroll-snap-type: x proximity;
  }

  .board--dragging {
    scroll-snap-type: none;
  }
}
</style>
