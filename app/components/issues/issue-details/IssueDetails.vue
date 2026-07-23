<template>
  <form
    :id="formId"
    class="issue-form"
    @submit.prevent="save">
    <div class="issue-form-main">
      <label>Issue text</label>
      <textarea
        v-model="state.content"
        :disabled="!viewModel.canEdit"
        rows="10" />
      <IssueAttachments
        :key="viewModel.issueKey"
        :attachments="viewModel.attachments"
        :disabled="!viewModel.canEdit || saving"
        :files="state.files"
        :on-change="changeFiles"
        :on-remove-attachment="removeAttachment"
        :removed-attachment-ids="state.removedAttachmentIds" />
    </div>
    <div class="issue-form-side">
      <label>Space</label>
      <select
        v-model="state.pickedSpaceId"
        :disabled="!viewModel.canEdit"
        @change="selectMoveSpace"
        @focus="loadMoveSpaces">
        <option
          disabled
          value="">
          Select space
        </option>
        <option
          v-if="lookup.loadingMoveSpaces"
          disabled
          value="__loading">
          Loading spaces…
        </option>
        <option :value="viewModel.spaceId">
          {{ state.spaceLabel || 'Current space' }}
        </option>
        <option
          v-for="space in spaceOptions"
          :key="space.value"
          :value="space.value">
          {{ space.label }}
        </option>
      </select>
      <label>Board</label>
      <select
        v-model="state.boardId"
        :aria-busy="lookup.loadingMoveBoards"
        :disabled="!viewModel.canEdit || lookup.loadingStatuses"
        @change="selectBoard"
        @focus="loadMoveBoards">
        <option
          disabled
          value="">
          Select board
        </option>
        <option
          v-if="lookup.loadingMoveBoards"
          disabled
          value="__loading">
          Loading boards…
        </option>
        <option
          v-if="state.pickedSpaceId === viewModel.spaceId"
          :value="viewModel.boardId">
          {{ state.boardLabel || 'No board' }}
        </option>
        <option
          v-for="board in boardOptions"
          :key="board.value"
          :value="board.value">
          {{ board.label }}
        </option>
      </select>
      <label>Status</label>
      <select
        v-model="state.statusId"
        :aria-busy="lookup.loadingStatuses"
        :disabled="!viewModel.canEdit || !state.boardId"
        @focus="loadStatuses">
        <option
          disabled
          value="">
          Select status
        </option>
        <option
          v-if="lookup.loadingStatuses"
          disabled
          value="__loading">
          Loading statuses…
        </option>
        <option
          v-if="state.boardId === viewModel.boardId && lookup.statuses.length === 0"
          :value="viewModel.statusId">
          {{ viewModel.statusLabel || 'Current status' }}
        </option>
        <option
          v-for="item in lookup.statuses"
          :key="item.id"
          :value="item.id">
          {{ item.name }}
        </option>
      </select>
      <div v-if="viewModel.attributes.length">
        <template
          v-for="attribute in viewModel.attributes"
          :key="attribute.id">
          <label :for="`issue-attribute-${attribute.id}`">
            <span
              class="attribute-dot"
              :style="{ background: attribute.color }" />
            {{ attribute.name }}
          </label>
          <input
            v-if="attribute.type === 'text'"
            :id="`issue-attribute-${attribute.id}`"
            v-model="state.attributeValues[attribute.id]"
            :disabled="!viewModel.canEdit"
            type="text" />
          <select
            v-else
            :id="`issue-attribute-${attribute.id}`"
            v-model="state.attributeValues[attribute.id]"
            :disabled="!viewModel.canEdit">
            <option value="">None</option>
            <option
              v-for="option in attribute.options"
              :key="option.value"
              :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </template>
      </div>
      <p
        v-if="displayError"
        class="form-error">
        {{ displayError }}
      </p>
      <label>Assignee</label>
      <div class="issue-person issue-assignee">
        <span
          class="avatar"
          :style="{ background: selectedAssignee.color }">
          {{ selectedAssignee.initials }}
        </span>
        <select
          v-model="state.assigneeId"
          :aria-busy="lookup.loadingAssignees"
          :disabled="!viewModel.canEdit"
          @focus="loadAssignees(state.pickedSpaceId)">
          <option
            v-if="!hasCurrentAssignee"
            :value="viewModel.assigneeId">
            {{ viewModel.assignee }}
          </option>
          <option
            v-if="lookup.loadingAssignees"
            disabled
            value="__loading">
            Loading assignees…
          </option>
          <option
            v-for="assignee in lookup.assignees"
            :key="assignee.value"
            :value="assignee.value">
            {{ assignee.label }}
          </option>
        </select>
      </div>
      <label>Owner</label>
      <div class="issue-person">
        <span
          class="avatar"
          :style="{ background: viewModel.ownerColor }">
          {{ viewModel.ownerInitial }}
        </span>
        <strong>{{ viewModel.owner }}</strong>
      </div>
      <div class="issue-dates">
        <div>
          <span>Created</span>
          <time :datetime="viewModel.createdAt">
            {{ formatDate(viewModel.createdAt) }}
          </time>
        </div>
        <div>
          <span>Updated</span>
          <time :datetime="viewModel.updatedAt">
            {{ formatDate(viewModel.updatedAt) }}
          </time>
        </div>
      </div>
    </div>
  </form>
</template>

<script lang="ts">
import type { IssueAttachmentViewModel } from '~/components/issues/IssueAttachments.vue'

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
})

type IssueDetailsAttributeViewModel =
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

export type IssueDetailsViewModel = {
  assignee: string
  assigneeColor: string
  assigneeId: string
  assigneeInitial: string
  attachments: IssueAttachmentViewModel[]
  attributes: IssueDetailsAttributeViewModel[]
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

export type IssueDetailsSaveInput = {
  assigneeId: string
  attributeValues: Record<string, string>
  boardId: string
  content: string
  files: File[]
  removeAttachmentIds: string[]
  statusId: string
}

type MoveOption = { label: string; value: string }
type AssigneeOption = MoveOption & { color: string; initials: string }

type IssueDetailsLookupState = {
  assignees: AssigneeOption[]
  boards: MoveOption[]
  error: null | string
  loadingAssignees: boolean
  loadingMoveBoards: boolean
  loadingMoveSpaces: boolean
  loadingStatuses: boolean
  spaces: MoveOption[]
  statuses: Array<{ id: string; name: string }>
}

type IssueDetailsProps = {
  error: null | string
  formId: string
  lookup: IssueDetailsLookupState
  onCanSaveChange: (canSave: boolean) => void
  onChangeMoveBoard: () => void
  onChangeMoveSpace: () => void
  onDirtyChange: (dirty: boolean) => void
  onLoadAssignees: (spaceId: string) => Promise<void> | void
  onLoadMoveBoards: (spaceId: string) => Promise<void> | void
  onLoadMoveSpaces: () => Promise<void> | void
  onLoadStatuses: (boardId: string) => Promise<void> | void
  onResetLookups: () => void
  onSave: (input: IssueDetailsSaveInput) => void
  saving: boolean
  viewModel: IssueDetailsViewModel
}
</script>

<script setup lang="ts">
import IssueAttachments from '~/components/issues/IssueAttachments.vue'

const props = defineProps<IssueDetailsProps>()

const state = reactive({
  assigneeId: props.viewModel.assigneeId,
  attributeValues: Object.fromEntries(
    props.viewModel.attributes.map((attribute) => [attribute.id, attribute.value]),
  ),
  boardId: props.viewModel.boardId,
  boardLabel: props.viewModel.boardLabel,
  content: props.viewModel.content,
  files: [] as File[],
  pickedSpaceId: props.viewModel.spaceId,
  removedAttachmentIds: [] as string[],
  spaceLabel: props.viewModel.spaceLabel,
  statusId: props.viewModel.statusId,
})
const spaceOptions = computed(() =>
  props.lookup.spaces.filter((space) => space.value !== props.viewModel.spaceId),
)
const boardOptions = computed(() =>
  props.lookup.boards.filter(
    (board) =>
      state.pickedSpaceId !== props.viewModel.spaceId || board.value !== props.viewModel.boardId,
  ),
)
const selectedAssignee = computed(
  () =>
    props.lookup.assignees.find((assignee) => assignee.value === state.assigneeId) ?? {
      color: props.viewModel.assigneeColor,
      initials: props.viewModel.assigneeInitial,
    },
)
const hasCurrentAssignee = computed(() =>
  props.lookup.assignees.some((assignee) => assignee.value === props.viewModel.assigneeId),
)
const canSave = computed(
  () =>
    !props.saving &&
    !!state.assigneeId &&
    !props.lookup.loadingStatuses &&
    (state.boardId === props.viewModel.boardId || !!state.statusId),
)
const displayError = computed(() => props.lookup.error ?? props.error)
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

watch(dirty, (value) => props.onDirtyChange(value), { immediate: true })
watch(canSave, (value) => props.onCanSaveChange(value), { immediate: true })
watch(() => props.viewModel.issueKey, resetLookups)

watch(
  () => props.viewModel,
  (viewModel) => {
    Object.assign(state, {
      assigneeId: viewModel.assigneeId,
      attributeValues: Object.fromEntries(
        viewModel.attributes.map((attribute) => [attribute.id, attribute.value]),
      ),
      boardId: viewModel.boardId,
      boardLabel: viewModel.boardLabel,
      content: viewModel.content,
      files: [],
      pickedSpaceId: viewModel.spaceId,
      removedAttachmentIds: [],
      spaceLabel: viewModel.spaceLabel,
      statusId: viewModel.statusId,
    })
  },
)

async function loadAssignees(spaceId: string) {
  if (!spaceId || props.lookup.loadingAssignees || props.lookup.assignees.length) {
    return
  }
  await props.onLoadAssignees(spaceId)
}

async function loadMoveSpaces() {
  if (props.lookup.loadingMoveSpaces || props.lookup.spaces.length) {
    return
  }
  await props.onLoadMoveSpaces()
}

function selectMoveSpace() {
  state.spaceLabel =
    props.lookup.spaces.find((space) => space.value === state.pickedSpaceId)?.label ??
    state.spaceLabel
  state.boardId = ''
  state.boardLabel = ''
  state.statusId = ''
  state.assigneeId = ''
  props.onChangeMoveSpace()
}

async function loadMoveBoards() {
  if (!state.pickedSpaceId || props.lookup.loadingMoveBoards || props.lookup.boards.length) {
    return
  }
  await props.onLoadMoveBoards(state.pickedSpaceId)
}

async function loadStatuses() {
  if (props.lookup.loadingStatuses || props.lookup.statuses.length || !state.boardId) {
    return
  }
  await props.onLoadStatuses(state.boardId)
}

function selectBoard() {
  if (state.boardId === '__loading') {
    return
  }
  const board = props.lookup.boards.find((item) => item.value === state.boardId)
  state.boardLabel = board?.label ?? state.boardLabel
  state.statusId = ''
  props.onChangeMoveBoard()
}

function formatDate(value: string) {
  return dateTimeFormatter.format(new Date(value))
}

function save() {
  if (!canSave.value) {
    return
  }
  props.onSave({
    assigneeId: state.assigneeId,
    attributeValues: Object.fromEntries(
      Object.entries(state.attributeValues).filter(([, value]) => value),
    ),
    boardId: state.boardId,
    content: state.content,
    files: state.files,
    removeAttachmentIds: state.removedAttachmentIds,
    statusId: state.statusId,
  })
}

function changeFiles(files: File[]) {
  state.files = files
}

function removeAttachment(id: string) {
  state.removedAttachmentIds.push(id)
}

function resetLookups() {
  Object.assign(state, {
    files: [],
    removedAttachmentIds: [],
  })
  props.onResetLookups()
}
</script>

<style scoped>
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

.issue-assignee select {
  flex: 1;
  min-width: 0;
}

.issue-dates {
  display: grid;
  gap: var(--space-2);
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: var(--space-4) 0;
}

.issue-dates > div {
  display: grid;
  gap: var(--space-1);
}

.issue-dates span {
  color: var(--color-muted);
  font-size: var(--font-size-small);
}

.issue-dates time {
  font-weight: var(--font-weight-semibold);
}

.attribute-dot {
  border-radius: var(--radius-pill);
  display: inline-block;
  height: 8px;
  margin-right: var(--space-1);
  width: 8px;
}

@media (max-width: 760px) {
  .issue-form {
    column-gap: 0;
  }
}
</style>
