<template>
  <form
    :id="formId"
    class="issue-form"
    @submit.prevent="save">
    <div class="issue-form-main">
      <textarea
        v-model="state.content"
        :disabled="!viewModel.canEdit"
        rows="10" />
      <IssueAttachments
        :key="viewModel.issueKey"
        :attachments="viewModel.attachments"
        class="issue-details-attachments"
        :disabled="!viewModel.canEdit || state.saving"
        :files="state.files"
        :on-change="changeFiles"
        :on-remove-attachment="removeAttachment"
        :removed-attachment-ids="state.removedAttachmentIds" />
      <p
        v-if="state.error"
        class="form-error">
        {{ state.error }}
      </p>
    </div>
    <div class="issue-form-side">
      <label>Space</label>
      <SpaceSelect
        :key="`space-${viewModel.issueKey}`"
        v-model="state.pickedSpaceId"
        :deps="deps.spaceSelect"
        :disabled="!viewModel.canEdit"
        :initial-option="{
          label: viewModel.spaceLabel || 'Current space',
          value: viewModel.spaceId,
        }" />
      <label>Board</label>
      <BoardSelect
        :key="`board-${viewModel.issueKey}`"
        v-model="state.boardId"
        :deps="deps.boardSelect"
        :disabled="!viewModel.canEdit"
        :initial-option="{
          label: viewModel.boardLabel || 'Current board',
          value: viewModel.boardId,
        }"
        :space-id="state.pickedSpaceId" />
      <label>Status</label>
      <StatusSelect
        :key="`status-${viewModel.issueKey}`"
        v-model="state.statusId"
        :board-id="state.boardId"
        :deps="deps.statusSelect"
        :disabled="!viewModel.canEdit"
        :initial-option="{
          label: viewModel.statusLabel || 'Current status',
          value: viewModel.statusId,
        }" />
      <label>Assignee</label>
      <AssigneeSelect
        :key="`assignee-${viewModel.issueKey}`"
        v-model="state.assigneeId"
        :deps="deps.assigneeSelect"
        :disabled="!viewModel.canEdit"
        :initial-option="{
          color: viewModel.assigneeColor,
          initials: viewModel.assigneeInitial,
          label: viewModel.assignee,
          value: viewModel.assigneeId,
        }"
        :space-id="state.pickedSpaceId" />
      <label>Owner</label>
      <div class="issue-person">
        <span
          class="avatar"
          :style="{ background: viewModel.ownerColor }">
          {{ viewModel.ownerInitial }}
        </span>
        <span>{{ viewModel.owner }}</span>
      </div>
      <IssueAttributeFields
        v-if="viewModel.attributes.length"
        v-model="state.attributeValues"
        :attributes="viewModel.attributes"
        :disabled="!viewModel.canEdit" />
      <span class="issue-date-label">Created</span>
      <time :datetime="viewModel.createdAt">
        {{ formatDate(viewModel.createdAt) }}
      </time>
      <span class="issue-date-label">Updated</span>
      <time :datetime="viewModel.updatedAt">
        {{ formatDate(viewModel.updatedAt) }}
      </time>
    </div>
  </form>
</template>

<script setup lang="ts">
import AssigneeSelect from '~/components/assignee-select/AssigneeSelect.vue'
import BoardSelect from '~/components/board-select/BoardSelect.vue'
import IssueAttachments from '~/components/issue-attachments/IssueAttachments.vue'
import IssueAttributeFields from '~/components/issue-attribute-fields/IssueAttributeFields.vue'
import type { IssueDetailsDeps, IssueDetailsSavedIssue } from '~/components/issue-details/deps'
import SpaceSelect from '~/components/space-select/SpaceSelect.vue'
import StatusSelect from '~/components/status-select/StatusSelect.vue'
import { getIssueAttributeValueInput } from '~/utils/issueAttributeValues'

import type { IssueDetailsViewModel } from './IssueDetails.types'

const props = defineProps<{
  deps: IssueDetailsDeps
  formId: string
  onCanSaveChange: (canSave: boolean) => void
  onDirtyChange: (dirty: boolean) => void
  onSaved: (issue: IssueDetailsSavedIssue) => Promise<void> | void
  onSavingChange: (saving: boolean) => void
  viewModel: IssueDetailsViewModel
}>()

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
})

const state = reactive({
  assigneeId: props.viewModel.assigneeId,
  attributeValues: Object.fromEntries(
    props.viewModel.attributes.map((attribute) => [attribute.id, attribute.value]),
  ),
  boardId: props.viewModel.boardId,
  content: props.viewModel.content,
  error: null as null | string,
  files: [] as File[],
  pickedSpaceId: props.viewModel.spaceId,
  removedAttachmentIds: [] as string[],
  saving: false,
  statusId: props.viewModel.statusId,
})

const canSave = computed(
  () =>
    !state.saving &&
    !!state.assigneeId &&
    (state.boardId === props.viewModel.boardId || !!state.statusId),
)

const dirty = computed(
  () =>
    state.assigneeId !== props.viewModel.assigneeId ||
    state.boardId !== props.viewModel.boardId ||
    state.content !== props.viewModel.content ||
    state.pickedSpaceId !== props.viewModel.spaceId ||
    state.statusId !== props.viewModel.statusId ||
    state.files.length > 0 ||
    state.removedAttachmentIds.length > 0 ||
    props.viewModel.attributes.some(
      (attribute) => state.attributeValues[attribute.id] !== attribute.value,
    ),
)

const formatDate = (value: string) => dateTimeFormatter.format(new Date(value))

const save = async () => {
  if (!canSave.value) {
    return
  }
  state.saving = true
  state.error = null
  const result = await props.deps.saveIssue({
    assigneeId: state.assigneeId,
    attributeValues: getIssueAttributeValueInput(
      Object.fromEntries(Object.entries(state.attributeValues).filter(([, value]) => value)),
      props.viewModel.attributes,
    ),
    boardId: state.boardId,
    content: state.content,
    files: state.files,
    issueKey: props.viewModel.issueKey,
    previousBoardId: props.viewModel.boardId,
    previousStatusId: props.viewModel.statusId,
    removeAttachmentIds: state.removedAttachmentIds,
    statusId: state.statusId,
  })
  state.saving = false

  if (result.ok) {
    await props.onSaved(result.value)
    return
  }
  if (result.error.type === 'invalidInput') {
    state.error = result.error.message
    return
  }
  if (result.error.type === 'partiallySaved') {
    await props.onSaved(result.error.issue)
    state.error = 'Changes were saved, but the issue could not be moved. Try again.'
    return
  }
  state.error = 'Could not save issue. Try again.'
}

const changeFiles = (files: File[]) => {
  state.files = files
}

const removeAttachment = (id: string) => {
  state.removedAttachmentIds.push(id)
}

watch(dirty, (value) => props.onDirtyChange(value), { immediate: true })

watch(canSave, (value) => props.onCanSaveChange(value), { immediate: true })

watch(
  () => state.saving,
  (value) => props.onSavingChange(value),
  { immediate: true },
)

watch(
  () => props.viewModel,
  (viewModel) => {
    Object.assign(state, {
      assigneeId: viewModel.assigneeId,
      attributeValues: Object.fromEntries(
        viewModel.attributes.map((attribute) => [attribute.id, attribute.value]),
      ),
      boardId: viewModel.boardId,
      content: viewModel.content,
      error: null,
      files: [],
      pickedSpaceId: viewModel.spaceId,
      removedAttachmentIds: [],
      statusId: viewModel.statusId,
    })
  },
)
</script>

<style scoped>
.issue-details-attachments {
  margin-top: var(--space-4);
}

.issue-person {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  min-height: var(--control-height);
}

.issue-person .avatar {
  font-size: var(--font-size-caption);
  height: 28px;
  width: 28px;
}

.issue-date-label {
  font-weight: var(--font-weight-semibold);
}

@media (max-width: 760px) {
  .issue-form {
    column-gap: 0;
  }
}
</style>
