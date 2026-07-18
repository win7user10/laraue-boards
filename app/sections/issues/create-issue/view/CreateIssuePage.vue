<template>
  <section>
    <div class="title-row">
      <div class="page-heading">
        <AppBackLink
          label="Back to issues"
          :to="organizationRoutes.issues()" />
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
        <label for="create-issue-content">Issue text</label>
        <textarea
          id="create-issue-content"
          v-model="content"
          placeholder="What needs attention?"
          required
          rows="10" />
      </div>
      <div class="task-side">
        <label for="create-issue-space">Space</label>
        <select
          id="create-issue-space"
          v-model="spaceId"
          :disabled="loadingBoards || viewModel.spaces.length === 0"
          required
          @change="changeSpace">
          <option
            v-if="viewModel.spaces.length === 0"
            disabled
            value="">
            No spaces available
          </option>
          <option
            v-for="space in viewModel.spaces"
            :key="space.value"
            :value="space.value">
            {{ space.label }}
          </option>
        </select>

        <label for="create-issue-board">Board</label>
        <select
          id="create-issue-board"
          v-model="boardId"
          :disabled="!spaceId"
          required
          @change="$emit('changeBoard', boardId)"
          @focus="$emit('loadBoards', spaceId)">
          <option
            disabled
            value="">
            Select board
          </option>
          <option
            v-if="loadingBoards"
            disabled
            value="__loading">
            Loading boards…
          </option>
          <option
            v-for="board in viewModel.boards"
            :key="board.value"
            :value="board.value">
            {{ board.label }}
          </option>
        </select>

        <label for="create-issue-status">Status</label>
        <select
          id="create-issue-status"
          v-model="statusId"
          :disabled="!boardId"
          required
          @focus="$emit('loadStatuses', boardId)">
          <option
            disabled
            value="">
            Select status
          </option>
          <option
            v-if="loadingStatuses"
            disabled
            value="__loading">
            Loading statuses…
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

        <label for="create-issue-assignee">Assignee</label>
        <div class="issue-assignee">
          <span class="avatar">{{ assigneeInitial }}</span>
          <select
            id="create-issue-assignee"
            v-model="assigneeId"
            required
            @focus="emit('loadAssignees', spaceId)">
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
export type CreateIssueAttributeViewModel =
  | { color: string; id: string; name: string; type: 'text' }
  | {
      color: string
      id: string
      name: string
      options: Array<{ label: string; value: string }>
      type: 'list'
    }

export type CreateIssuePageOption = { label: string; value: string }

export type CreateIssuePageViewModel = {
  attributes: CreateIssueAttributeViewModel[]
  boardId: string
  boards: CreateIssuePageOption[]
  spaceId: string
  spaces: CreateIssuePageOption[]
  statuses: CreateIssuePageOption[]
  statusId: string
}

type CreateIssuePageProps = {
  assignees: CreateIssuePageOption[]
  error: null | string
  loadingAssignees: boolean
  loadingBoards: boolean
  loadingStatuses: boolean
  submitting: boolean
  viewModel: CreateIssuePageViewModel
}
</script>

<script setup lang="ts">
import { ListPlus } from 'lucide-vue-next'

import IssueAttributeFields from '~/components/issues/IssueAttributeFields.vue'

const props = defineProps<CreateIssuePageProps>()
const emit = defineEmits<{
  changeBoard: [boardId: string]
  changeSpace: [spaceId: string]
  loadAssignees: [spaceId: string]
  loadBoards: [spaceId: string]
  loadStatuses: [boardId: string]
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
const spaceId = ref(props.viewModel.spaceId)
const boardId = ref(props.viewModel.boardId)
const statusId = ref(props.viewModel.statusId)
const attributeValues = ref<Record<string, string>>({})

function changeSpace() {
  assigneeId.value = ''
  emit('changeSpace', spaceId.value)
}

watch(
  () => props.viewModel.spaceId,
  (value) => (spaceId.value = value),
)
watch(
  () => props.viewModel.boardId,
  (value) => (boardId.value = value),
)
watch(
  () => props.viewModel.statusId,
  (value) => (statusId.value = value),
)
</script>

<style scoped>
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
