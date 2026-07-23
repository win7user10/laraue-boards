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
        :disabled="!viewModel.canEdit || state.saving"
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
          v-if="state.lookup.loadingMoveSpaces"
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
        :aria-busy="state.lookup.loadingMoveBoards"
        :disabled="!viewModel.canEdit || state.lookup.loadingStatuses"
        @change="selectBoard"
        @focus="loadMoveBoards">
        <option
          disabled
          value="">
          Select board
        </option>
        <option
          v-if="state.lookup.loadingMoveBoards"
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
        :aria-busy="state.lookup.loadingStatuses"
        :disabled="!viewModel.canEdit || !state.boardId"
        @focus="loadStatuses">
        <option
          disabled
          value="">
          Select status
        </option>
        <option
          v-if="state.lookup.loadingStatuses"
          disabled
          value="__loading">
          Loading statuses…
        </option>
        <option
          v-if="state.boardId === viewModel.boardId && state.lookup.statuses.length === 0"
          :value="viewModel.statusId">
          {{ viewModel.statusLabel || 'Current status' }}
        </option>
        <option
          v-for="item in state.lookup.statuses"
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
          :aria-busy="state.lookup.loadingAssignees"
          :disabled="!viewModel.canEdit"
          @focus="loadAssignees(state.pickedSpaceId)">
          <option
            v-if="!hasCurrentAssignee"
            :value="viewModel.assigneeId">
            {{ viewModel.assignee }}
          </option>
          <option
            v-if="state.lookup.loadingAssignees"
            disabled
            value="__loading">
            Loading assignees…
          </option>
          <option
            v-for="assignee in state.lookup.assignees"
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

<script setup lang="ts">
import type {
  IssueDetailsDeps,
  IssueDetailsSavedIssue,
} from '~/components/issues/issue-details/deps'
import IssueAttachments from '~/components/issues/IssueAttachments.vue'
import type { Result } from '~/utils/actionResult'
import { getIssueAttributeValueInput } from '~/utils/issueAttributeValues'

import type {
  IssueDetailsAssigneeOption,
  IssueDetailsMoveOption,
  IssueDetailsStatusOption,
  IssueDetailsViewModel,
} from './IssueDetails.types'

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
  boardLabel: props.viewModel.boardLabel,
  content: props.viewModel.content,
  error: null as null | string,
  files: [] as File[],
  lookup: {
    assignees: [] as IssueDetailsAssigneeOption[],
    boards: [] as IssueDetailsMoveOption[],
    error: null as null | string,
    loadingAssignees: false,
    loadingMoveBoards: false,
    loadingMoveSpaces: false,
    loadingStatuses: false,
    spaces: [] as IssueDetailsMoveOption[],
    statuses: [] as IssueDetailsStatusOption[],
  },
  pickedSpaceId: props.viewModel.spaceId,
  removedAttachmentIds: [] as string[],
  saving: false,
  spaceLabel: props.viewModel.spaceLabel,
  statusId: props.viewModel.statusId,
})
const spaceOptions = computed(() =>
  state.lookup.spaces.filter((space) => space.value !== props.viewModel.spaceId),
)
const boardOptions = computed(() =>
  state.lookup.boards.filter(
    (board) =>
      state.pickedSpaceId !== props.viewModel.spaceId || board.value !== props.viewModel.boardId,
  ),
)
const selectedAssignee = computed(
  () =>
    state.lookup.assignees.find((assignee) => assignee.value === state.assigneeId) ?? {
      color: props.viewModel.assigneeColor,
      initials: props.viewModel.assigneeInitial,
    },
)
const hasCurrentAssignee = computed(() =>
  state.lookup.assignees.some((assignee) => assignee.value === props.viewModel.assigneeId),
)
const canSave = computed(
  () =>
    !state.saving &&
    !!state.assigneeId &&
    !state.lookup.loadingStatuses &&
    (state.boardId === props.viewModel.boardId || !!state.statusId),
)
const displayError = computed(() => state.lookup.error ?? state.error)
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

type LookupLoading =
  | 'loadingAssignees'
  | 'loadingMoveBoards'
  | 'loadingMoveSpaces'
  | 'loadingStatuses'

const resetLookups = () => {
  Object.assign(state.lookup, {
    assignees: [],
    boards: [],
    error: null,
    loadingAssignees: false,
    loadingMoveBoards: false,
    loadingMoveSpaces: false,
    loadingStatuses: false,
    spaces: [],
    statuses: [],
  })
}

const loadLookup = async <Value>(options: {
  apply: (value: Value) => void
  errorMessage: string
  loading: LookupLoading
  request: () => Promise<Result<Value>>
}) => {
  state.lookup.error = null
  state.lookup[options.loading] = true
  const result = await options.request()
  state.lookup[options.loading] = false
  if (!result.ok) {
    state.lookup.error = options.errorMessage
    return
  }
  options.apply(result.value)
}

const loadAssignees = async (spaceId: string) => {
  if (!spaceId || state.lookup.loadingAssignees || state.lookup.assignees.length) {
    return
  }
  await loadLookup({
    apply: (assignees) => {
      state.lookup.assignees = assignees
    },
    errorMessage: 'Could not load assignees.',
    loading: 'loadingAssignees',
    request: () => props.deps.loadAssignees({ spaceId }),
  })
}

const loadMoveSpaces = async () => {
  if (state.lookup.loadingMoveSpaces || state.lookup.spaces.length) {
    return
  }
  await loadLookup({
    apply: (spaces) => {
      state.lookup.spaces = spaces
    },
    errorMessage: 'Could not load available spaces.',
    loading: 'loadingMoveSpaces',
    request: props.deps.loadMoveSpaces,
  })
}

const selectMoveSpace = () => {
  state.spaceLabel =
    state.lookup.spaces.find((space) => space.value === state.pickedSpaceId)?.label ??
    state.spaceLabel
  state.boardId = ''
  state.boardLabel = ''
  state.statusId = ''
  state.assigneeId = ''
  Object.assign(state.lookup, {
    assignees: [],
    boards: [],
    error: null,
    loadingAssignees: false,
    loadingMoveBoards: false,
    loadingStatuses: false,
    statuses: [],
  })
}

const loadMoveBoards = async () => {
  if (!state.pickedSpaceId || state.lookup.loadingMoveBoards || state.lookup.boards.length) {
    return
  }
  await loadLookup({
    apply: (boards) => {
      state.lookup.boards = boards
    },
    errorMessage: 'Could not load boards.',
    loading: 'loadingMoveBoards',
    request: () => props.deps.loadMoveBoards({ spaceId: state.pickedSpaceId }),
  })
}

const loadStatuses = async () => {
  if (state.lookup.loadingStatuses || state.lookup.statuses.length || !state.boardId) {
    return
  }
  await loadLookup({
    apply: (statuses) => {
      state.lookup.statuses = statuses
    },
    errorMessage: 'Could not load board statuses.',
    loading: 'loadingStatuses',
    request: () => props.deps.loadStatuses({ boardId: state.boardId }),
  })
}

const selectBoard = () => {
  if (state.boardId === '__loading') {
    return
  }
  const board = state.lookup.boards.find((item) => item.value === state.boardId)
  state.boardLabel = board?.label ?? state.boardLabel
  state.statusId = ''
  state.lookup.error = null
  state.lookup.loadingStatuses = false
  state.lookup.statuses = []
}

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
      boardLabel: viewModel.boardLabel,
      content: viewModel.content,
      error: null,
      files: [],
      pickedSpaceId: viewModel.spaceId,
      removedAttachmentIds: [],
      spaceLabel: viewModel.spaceLabel,
      statusId: viewModel.statusId,
    })
    resetLookups()
  },
)
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
