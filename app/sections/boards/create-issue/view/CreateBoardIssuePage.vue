<template>
  <section>
    <div class="title-row">
      <div class="page-heading">
        <AppBackLink
          label="Back to board"
          :to="organizationRoutes.board(spaceKey, viewModel.boardId)" />
        <ListPlus class="page-heading-icon" />
        <div class="page-heading-text">
          <h1>Add issue</h1>
        </div>
      </div>
    </div>
    <form
      class="task-page"
      @submit.prevent="
        $emit('submit', {
          assigneeId,
          attributeValues,
          content: content.trim(),
          statusId,
        })
      ">
      <div class="task-main">
        <label for="create-board-issue-content">Issue text</label>
        <textarea
          id="create-board-issue-content"
          v-model="content"
          placeholder="What needs attention?"
          required
          rows="10" />
      </div>
      <div class="task-side">
        <label>Board</label>
        <div class="selected-entity">{{ viewModel.boardName }}</div>

        <label for="create-board-issue-status">Status</label>
        <select
          id="create-board-issue-status"
          v-model="statusId"
          :disabled="viewModel.statuses.length === 0"
          required>
          <option
            v-if="viewModel.statuses.length === 0"
            disabled
            value="">
            No statuses available
          </option>
          <option
            v-for="status in viewModel.statuses"
            :key="status.value"
            :value="status.value">
            {{ status.label }}
          </option>
        </select>

        <IssueAttributeFields
          v-model="attributeValues"
          :attributes="viewModel.attributes" />

        <label for="create-board-issue-assignee">Assignee</label>
        <div class="issue-assignee">
          <span class="avatar">{{ assigneeInitial }}</span>
          <select
            id="create-board-issue-assignee"
            v-model="assigneeId"
            required
            @focus="$emit('loadAssignees')">
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
export type CreateBoardIssueAttributeViewModel =
  | { color: string; id: string; name: string; type: 'text' }
  | {
      color: string
      id: string
      name: string
      options: Array<{ label: string; value: string }>
      type: 'list'
    }

export type CreateBoardIssuePageViewModel = {
  attributes: CreateBoardIssueAttributeViewModel[]
  boardId: string
  boardName: string
  statuses: Array<{ label: string; value: string }>
  statusId: string
}

type CreateBoardIssuePageProps = {
  assignees: Array<{ label: string; value: string }>
  error: null | string
  loadingAssignees: boolean
  spaceKey: string
  submitting: boolean
  viewModel: CreateBoardIssuePageViewModel
}
</script>

<script setup lang="ts">
import { ListPlus } from 'lucide-vue-next'

import IssueAttributeFields from '~/components/issues/IssueAttributeFields.vue'

const props = defineProps<CreateBoardIssuePageProps>()
defineEmits<{
  loadAssignees: []
  submit: [
    input: {
      assigneeId: string
      attributeValues: Record<string, string>
      content: string
      statusId: string
    },
  ]
}>()
const organizationRoutes = useOrganizationRoutes()
const content = ref('')
const assigneeId = ref('')
const assigneeInitial = computed(
  () =>
    props.assignees
      .find((assignee) => assignee.value === assigneeId.value)
      ?.label.slice(0, 2) || '?',
)
const statusId = ref(props.viewModel.statusId)
const attributeValues = ref<Record<string, string>>({})
watch(
  () => props.viewModel.statusId,
  (value) => (statusId.value = value),
)
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
