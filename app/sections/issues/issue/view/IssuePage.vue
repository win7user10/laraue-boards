<template>
  <section>
    <IssueDetails
      :assignees="assignees"
      :error="error"
      :loading-assignees="loadingAssignees"
      :loading-move-boards="loadingMoveBoards"
      :loading-move-spaces="loadingMoveSpaces"
      :loading-statuses="loadingStatuses"
      :move-boards="moveBoards"
      :move-spaces="moveSpaces"
      :saving="saving"
      :statuses="statuses"
      :view-model="viewModel"
      @change-board="emit('changeBoard')"
      @change-move-space="emit('changeMoveSpace', $event)"
      @load-assignees="emit('loadAssignees', $event)"
      @load-move-boards="emit('loadMoveBoards', $event)"
      @load-move-spaces="emit('loadMoveSpaces')"
      @load-statuses="emit('loadStatuses', $event)"
      @save="emit('save', $event)">
      <template #header>
        <div class="title-row">
          <div class="page-heading">
            <button
              aria-label="Back"
              class="icon-btn"
              type="button"
              @click="emit('back')">
              <ArrowLeft />
            </button>
            <div class="page-heading-text">
              <h1>{{ viewModel.issueKey }}</h1>
            </div>
          </div>
        </div>
      </template>
      <template #side-actions="{ canSave }">
        <div
          v-if="viewModel.canEdit"
          class="page-actions">
          <button
            class="primary"
            :disabled="!canSave"
            type="submit">
            {{ saving ? 'Saving…' : 'Save changes' }}
          </button>
          <button
            class="secondary danger"
            :disabled="saving"
            type="button"
            @click="emit('delete')">
            <Trash2 />
            Delete issue
          </button>
        </div>
      </template>
    </IssueDetails>
  </section>
</template>

<script lang="ts">
export type IssuePageAttributeViewModel =
  | {
      color: string
      id: string
      name: string
      options: Array<{ label: string; value: string }>
      type: 'list'
      value: string
    }
  | {
      color: string
      id: string
      name: string
      type: 'text'
      value: string
    }

export type IssuePageViewModel = {
  assignee: string
  assigneeId: string
  assigneeInitial: string
  attributes: IssuePageAttributeViewModel[]
  boardId: string
  boardLabel: string
  canEdit: boolean
  content: string
  createdAt: string
  id: string
  issueKey: string
  owner: string
  ownerInitial: string
  spaceId: string
  spaceLabel: string
  statusId: string
  statusLabel: string
  updatedAt: string
}

type IssuePageSaveInput = {
  assigneeId: string
  attributeValues: Record<string, string>
  boardId: string
  content: string
  statusId: string
}

type MoveOption = { label: string; value: string }

type IssuePageProps = {
  assignees: MoveOption[]
  error: null | string
  loadingAssignees: boolean
  loadingMoveBoards: boolean
  loadingMoveSpaces: boolean
  loadingStatuses: boolean
  moveBoards: MoveOption[]
  moveSpaces: MoveOption[]
  saving: boolean
  statuses: Array<{ id: string; name: string }>
  viewModel: IssuePageViewModel
}
</script>

<script setup lang="ts">
import { ArrowLeft, Trash2 } from 'lucide-vue-next'

import IssueDetails from '~/components/issues/IssueDetails.vue'

defineProps<IssuePageProps>()
const emit = defineEmits<{
  back: []
  changeBoard: []
  changeMoveSpace: [spaceId: string]
  delete: []
  loadAssignees: [spaceId: string]
  loadMoveBoards: [spaceId: string]
  loadMoveSpaces: []
  loadStatuses: [boardId: string]
  save: [input: IssuePageSaveInput]
}>()
</script>
