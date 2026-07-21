<template>
  <section>
    <div class="title-row">
      <div class="page-heading">
        <AppBackLink
          label="Back to backlog"
          :to="organizationRoutes.backlog(viewModel.spaceKey)" />
        <ListPlus class="page-heading-icon" />
        <div class="page-heading-text">
          <h1>Add backlog issue</h1>
        </div>
      </div>
    </div>
    <form
      class="issue-form"
      @submit.prevent="
        props.onSubmit({
          assigneeId,
          attributeValues,
          content: content.trim(),
          files,
          statusId,
        })
      ">
      <div class="issue-form-main">
        <label for="create-backlog-issue-content">Issue text</label>
        <textarea
          id="create-backlog-issue-content"
          v-model="content"
          placeholder="What needs attention?"
          required
          rows="10" />
        <IssueAttachments
          :attachments="[]"
          :disabled="submitting"
          :files="files"
          :on-change="changeFiles" />
      </div>
      <div class="issue-form-side">
        <label>Board</label>
        <div class="selected-entity">
          {{ viewModel.boardName }}
        </div>

        <IssueAttributeFields
          v-model="attributeValues"
          :attributes="viewModel.attributes" />

        <label for="create-backlog-issue-assignee">Assignee</label>
        <div class="issue-assignee">
          <span
            class="avatar"
            :style="{ background: assignee?.color }">
            {{ assigneeInitial }}
          </span>
          <select
            id="create-backlog-issue-assignee"
            v-model="assigneeId"
            required
            @focus="props.onLoadAssignees">
            <option
              disabled
              value="">
              Select assignee
            </option>
            <option
              v-if="loadingAssignees"
              disabled
              value="__loading">
              Loading assignees…
            </option>
            <option
              v-for="assignee in assignees"
              :key="assignee.value"
              :value="assignee.value">
              {{ assignee.label }}
            </option>
          </select>
        </div>

        <p
          v-if="error"
          class="form-error">
          {{ error }}
        </p>
        <div class="page-actions">
          <button
            class="primary"
            :disabled="submitting || !statusId || !assigneeId">
            {{ submitting ? 'Adding…' : 'Add issue' }}
          </button>
        </div>
      </div>
    </form>
  </section>
</template>

<script lang="ts">
export type CreateBacklogIssueAttributeViewModel =
  | { color: string; id: string; name: string; type: 'text' }
  | {
      color: string
      id: string
      name: string
      options: Array<{ label: string; value: string }>
      type: 'list'
    }

export type CreateBacklogIssuePageViewModel = {
  attributes: CreateBacklogIssueAttributeViewModel[]
  boardName: string
  spaceId: string
  spaceKey: string
  statusId: string
}

type CreateBacklogIssuePageProps = {
  assignees: Array<{
    color: string
    initials: string
    label: string
    value: string
  }>
  error: null | string
  loadingAssignees: boolean
  onLoadAssignees: () => void
  onSubmit: (input: {
    assigneeId: string
    attributeValues: Record<string, string>
    content: string
    files: File[]
    statusId: string
  }) => void
  submitting: boolean
  viewModel: CreateBacklogIssuePageViewModel
}
</script>

<script setup lang="ts">
import { ListPlus } from 'lucide-vue-next'

import IssueAttachments from '~/components/issues/IssueAttachments.vue'
import IssueAttributeFields from '~/components/issues/IssueAttributeFields.vue'

const props = defineProps<CreateBacklogIssuePageProps>()
const organizationRoutes = useOrganizationRoutes()
const content = ref('')
const files = ref<File[]>([])
const assigneeId = ref('')
const assignee = computed(() =>
  props.assignees.find((assignee) => assignee.value === assigneeId.value),
)
const assigneeInitial = computed(() => assignee.value?.initials || '?')
const statusId = computed(() => props.viewModel.statusId)
const attributeValues = ref<Record<string, string>>({})

function changeFiles(value: File[]) {
  files.value = value
}
</script>

<style scoped>
.selected-entity {
  align-items: center;
  background: var(--color-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  display: flex;
  min-height: var(--control-height);
  padding: 0 var(--space-3);
}

.issue-assignee {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  min-height: var(--control-height);
}

.issue-assignee .avatar {
  font-size: var(--font-size-caption);
  height: 28px;
  width: 28px;
}

.issue-assignee select {
  flex: 1;
  min-width: 0;
}
</style>
