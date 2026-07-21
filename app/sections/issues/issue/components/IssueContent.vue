<template>
  <section>
    <IssueDetails
      :deps="issueDetailsDeps"
      :error="error"
      :on-dirty-change="onDirtyChange"
      :on-save="onSave"
      :saving="saving"
      :view-model="viewModel">
      <template #header>
        <div class="title-row">
          <div class="page-heading">
            <button
              aria-label="Back"
              class="icon-btn"
              type="button"
              @click="onBack">
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
            @click="onDelete">
            <Trash2 />
            Delete issue
          </button>
        </div>
      </template>
    </IssueDetails>
  </section>
</template>

<script lang="ts">
import type { IssueDetailsSaveInput } from '~/components/issues/issue-details/IssueDetails.vue'
import type { IssueDetailsDeps } from '~/components/issues/issue-details/IssueDetailsDeps'

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
  assigneeColor: string
  assigneeId: string
  assigneeInitial: string
  attributes: IssuePageAttributeViewModel[]
  boardId: string
  boardLabel: string
  canEdit: boolean
  content: string
  createdAt: string
  issueKey: string
  owner: string
  ownerColor: string
  ownerInitial: string
  spaceId: string
  spaceLabel: string
  statusId: string
  statusLabel: string
  updatedAt: string
}

type IssuePageProps = {
  error: null | string
  issueDetailsDeps: IssueDetailsDeps
  onBack: () => void
  onDelete: () => void
  onDirtyChange: (dirty: boolean) => void
  onSave: (input: IssueDetailsSaveInput) => void
  saving: boolean
  viewModel: IssuePageViewModel
}
</script>

<script setup lang="ts">
import { ArrowLeft, Trash2 } from 'lucide-vue-next'

import IssueDetails from '~/components/issues/issue-details/IssueDetails.vue'

defineProps<IssuePageProps>()
</script>
