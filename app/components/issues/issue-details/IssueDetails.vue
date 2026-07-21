<template>
  <form
    class="issue-details"
    @submit.prevent="save">
    <slot name="header" />
    <div class="issue-form">
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
          :on-change="changeFiles" />
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
            v-if="state.loadingMoveSpaces"
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
          :aria-busy="state.loadingMoveBoards"
          :disabled="!viewModel.canEdit || state.loadingStatuses"
          @change="selectBoard"
          @focus="loadMoveBoards">
          <option
            disabled
            value="">
            Select board
          </option>
          <option
            v-if="state.loadingMoveBoards"
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
          :aria-busy="state.loadingStatuses"
          :disabled="!viewModel.canEdit || !state.boardId"
          @focus="loadStatuses">
          <option
            disabled
            value="">
            Select status
          </option>
          <option
            v-if="state.loadingStatuses"
            disabled
            value="__loading">
            Loading statuses…
          </option>
          <option
            v-if="
              state.boardId === viewModel.boardId && state.statuses.length === 0
            "
            :value="viewModel.statusId">
            {{ viewModel.statusLabel || 'Current status' }}
          </option>
          <option
            v-for="item in state.statuses"
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
            :aria-busy="state.loadingAssignees"
            :disabled="!viewModel.canEdit"
            @focus="loadAssignees(state.pickedSpaceId)">
            <option
              v-if="!hasCurrentAssignee"
              :value="viewModel.assigneeId">
              {{ viewModel.assignee }}
            </option>
            <option
              v-if="state.loadingAssignees"
              disabled
              value="__loading">
              Loading assignees…
            </option>
            <option
              v-for="assignee in state.assignees"
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
        <slot
          :can-save="canSave"
          name="side-actions" />
      </div>
    </div>
    <slot
      :can-save="canSave"
      name="footer" />
  </form>
</template>

<script lang="ts">
import type { IssueDetailsDeps } from '~/components/issues/issue-details/IssueDetailsDeps'
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
  statusId: string
}

type MoveOption = { label: string; value: string }
type AssigneeOption = MoveOption & { color: string; initials: string }

export type IssueDetailsProps = {
  deps: IssueDetailsDeps
  error: null | string
  onDirtyChange: (dirty: boolean) => void
  onSave: (input: IssueDetailsSaveInput) => void
  saving: boolean
  viewModel: IssueDetailsViewModel
}
</script>

<script setup lang="ts">
import IssueAttachments from '~/components/issues/IssueAttachments.vue'

const props = defineProps<IssueDetailsProps>()
defineSlots<{
  footer?: (props: { canSave: boolean }) => unknown
  header?: () => unknown
  'side-actions'?: (props: { canSave: boolean }) => unknown
}>()

const state = reactive({
  assigneeId: props.viewModel.assigneeId,
  assignees: [] as AssigneeOption[],
  attributeValues: Object.fromEntries(
    props.viewModel.attributes.map((attribute) => [
      attribute.id,
      attribute.value,
    ]),
  ),
  boardId: props.viewModel.boardId,
  boardLabel: props.viewModel.boardLabel,
  content: props.viewModel.content,
  files: [] as File[],
  loadingAssignees: false,
  loadingMoveBoards: false,
  loadingMoveSpaces: false,
  loadingStatuses: false,
  lookupError: null as null | string,
  moveBoards: [] as MoveOption[],
  moveSpaces: [] as MoveOption[],
  pickedSpaceId: props.viewModel.spaceId,
  spaceLabel: props.viewModel.spaceLabel,
  statuses: [] as Array<{ id: string; name: string }>,
  statusId: props.viewModel.statusId,
})
const spaceOptions = computed(() =>
  state.moveSpaces.filter((space) => space.value !== props.viewModel.spaceId),
)
const boardOptions = computed(() =>
  state.moveBoards.filter(
    (board) =>
      state.pickedSpaceId !== props.viewModel.spaceId ||
      board.value !== props.viewModel.boardId,
  ),
)
const selectedAssignee = computed(
  () =>
    state.assignees.find((assignee) => assignee.value === state.assigneeId) ?? {
      color: props.viewModel.assigneeColor,
      initials: props.viewModel.assigneeInitial,
    },
)
const hasCurrentAssignee = computed(() =>
  state.assignees.some(
    (assignee) => assignee.value === props.viewModel.assigneeId,
  ),
)
const canSave = computed(
  () =>
    !props.saving &&
    !!state.assigneeId &&
    !state.loadingStatuses &&
    (state.boardId === props.viewModel.boardId || !!state.statusId),
)
const displayError = computed(() => state.lookupError ?? props.error)
const dirty = computed(
  () =>
    state.assigneeId !== props.viewModel.assigneeId ||
    state.boardId !== props.viewModel.boardId ||
    state.content !== props.viewModel.content ||
    state.pickedSpaceId !== props.viewModel.spaceId ||
    state.statusId !== props.viewModel.statusId ||
    state.files.length > 0 ||
    props.viewModel.attributes.some(
      (attribute) => state.attributeValues[attribute.id] !== attribute.value,
    ),
)

watch(dirty, (value) => props.onDirtyChange(value), { immediate: true })
watch(() => props.viewModel.issueKey, resetLookups)

watch(
  () => props.viewModel,
  (viewModel) => {
    Object.assign(state, {
      assigneeId: viewModel.assigneeId,
      attributeValues: Object.fromEntries(
        viewModel.attributes.map((attribute) => [
          attribute.id,
          attribute.value,
        ]),
      ),
      boardId: viewModel.boardId,
      boardLabel: viewModel.boardLabel,
      content: viewModel.content,
      pickedSpaceId: viewModel.spaceId,
      spaceLabel: viewModel.spaceLabel,
      statusId: viewModel.statusId,
    })
  },
)

async function loadAssignees(spaceId: string) {
  if (!spaceId || state.loadingAssignees || state.assignees.length) {
    return
  }

  state.lookupError = null
  state.loadingAssignees = true
  const result = await props.deps.loadAssignees({ spaceId })
  state.loadingAssignees = false
  matchActionResult({
    err: (error) => {
      state.lookupError = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have access to space members.',
          SpaceNotFound: 'The selected space was not found.',
          TemporarilyUnavailable: 'Could not load assignees. Try again.',
        },
      })
    },
    ok: (value) => {
      state.assignees = value.assignees
    },
    result,
  })
}

async function loadMoveSpaces() {
  if (state.loadingMoveSpaces || state.moveSpaces.length) {
    return
  }

  state.lookupError = null
  state.loadingMoveSpaces = true
  const result = await props.deps.loadMoveSpaces()
  state.loadingMoveSpaces = false
  matchActionResult({
    err: (error) => {
      state.lookupError = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have access to available spaces.',
          TemporarilyUnavailable: 'Could not load available spaces.',
        },
      })
    },
    ok: (value) => {
      state.moveSpaces = value.spaces
    },
    result,
  })
}

function selectMoveSpace() {
  state.spaceLabel =
    state.moveSpaces.find((space) => space.value === state.pickedSpaceId)
      ?.label ?? state.spaceLabel
  state.boardId = ''
  state.boardLabel = ''
  state.statusId = ''
  state.assigneeId = ''
  state.assignees = []
  state.loadingAssignees = false
  state.loadingMoveBoards = false
  state.loadingStatuses = false
  state.lookupError = null
  state.moveBoards = []
  state.statuses = []
}

async function loadMoveBoards() {
  if (
    !state.pickedSpaceId ||
    state.loadingMoveBoards ||
    state.moveBoards.length
  ) {
    return
  }

  state.lookupError = null
  state.loadingMoveBoards = true
  const result = await props.deps.loadMoveBoards({
    spaceId: state.pickedSpaceId,
  })
  state.loadingMoveBoards = false
  matchActionResult({
    err: (error) => {
      state.lookupError = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have access to this space.',
          SpaceNotFound: 'This space no longer exists.',
          TemporarilyUnavailable: 'Could not load space boards.',
        },
      })
    },
    ok: (value) => {
      state.moveBoards = value.boards
    },
    result,
  })
}

async function loadStatuses() {
  if (state.loadingStatuses || state.statuses.length || !state.boardId) {
    return
  }

  state.lookupError = null
  state.loadingStatuses = true
  const result = await props.deps.loadStatuses({ boardId: state.boardId })
  matchActionResult({
    err: (error) => {
      state.statuses = []
      state.lookupError = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have access to this board.',
          BoardNotFound: 'This board no longer exists.',
          TemporarilyUnavailable: 'Could not load board statuses.',
        },
      })
    },
    ok: (value) => {
      state.statuses = value.statuses
    },
    result,
  })
  state.loadingStatuses = false
}

function selectBoard() {
  if (state.boardId === '__loading') {
    return
  }
  const board = state.moveBoards.find((item) => item.value === state.boardId)
  state.boardLabel = board?.label ?? state.boardLabel
  state.statusId = ''
  state.loadingStatuses = false
  state.statuses = []
  state.lookupError = null
}

function formatDate(value: string) {
  return dateTimeFormatter.format(new Date(value))
}

function save() {
  if (!canSave.value) {
    return
  }
  state.lookupError = null
  props.onSave({
    assigneeId: state.assigneeId,
    attributeValues: Object.fromEntries(
      Object.entries(state.attributeValues).filter(([, value]) => value),
    ),
    boardId: state.boardId,
    content: state.content,
    files: state.files,
    statusId: state.statusId,
  })
}

function changeFiles(files: File[]) {
  state.files = files
}

function resetLookups() {
  Object.assign(state, {
    assignees: [],
    files: [],
    loadingAssignees: false,
    loadingMoveBoards: false,
    loadingMoveSpaces: false,
    loadingStatuses: false,
    lookupError: null,
    moveBoards: [],
    moveSpaces: [],
    statuses: [],
  })
}
</script>

<style scoped>
.issue-details--dialog {
  display: grid;
  gap: 0;
  grid-template-rows: auto minmax(0, 1fr) auto;
  max-height: calc(
    100dvh - var(--space-8) - var(--space-8) - var(--space-6) - var(--space-6)
  );
}

.issue-details--dialog .issue-form {
  column-gap: var(--space-6);
  min-height: 0;
  overflow: auto;
  padding: var(--space-1);
  scrollbar-gutter: stable;
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
  .issue-details--dialog {
    height: 100%;
    max-height: none;
  }

  .issue-details--dialog .issue-form {
    column-gap: 0;
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: max-content max-content;
  }
}
</style>
