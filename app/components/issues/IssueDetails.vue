<template>
  <form
    class="issue-details"
    @submit.prevent="save">
    <slot name="header" />
    <div class="task-page">
      <div class="task-main">
        <label>Issue text</label>
        <textarea
          v-model="content"
          :disabled="!viewModel.canEdit"
          rows="10" />
      </div>
      <div class="task-side">
        <label>Space</label>
        <select
          v-model="pickedSpaceId"
          :disabled="!viewModel.canEdit"
          @change="selectMoveSpace"
          @focus="loadMoveSpaces">
          <option
            disabled
            value="">
            Select space
          </option>
          <option
            v-if="loadingMoveSpaces"
            disabled
            value="__loading">
            Loading spaces…
          </option>
          <option :value="viewModel.spaceId">
            {{ spaceLabel || 'Current space' }}
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
          v-model="boardId"
          :aria-busy="loadingMoveBoards"
          :disabled="!viewModel.canEdit || loadingStatuses"
          @change="selectBoard"
          @focus="loadMoveBoards">
          <option
            disabled
            value="">
            Select board
          </option>
          <option
            v-if="loadingMoveBoards"
            disabled
            value="__loading">
            Loading boards…
          </option>
          <option
            v-if="pickedSpaceId === viewModel.spaceId"
            :value="viewModel.boardId">
            {{ boardLabel || 'No board' }}
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
          v-model="statusId"
          :aria-busy="loadingStatuses"
          :disabled="!viewModel.canEdit || !boardId"
          @focus="loadStatuses">
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
            v-if="boardId === viewModel.boardId && statuses.length === 0"
            :value="viewModel.statusId">
            {{ viewModel.statusLabel || 'Current status' }}
          </option>
          <option
            v-for="item in statuses"
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
              v-model="attributeValues[attribute.id]"
              :disabled="!viewModel.canEdit"
              type="text" />
            <select
              v-else
              :id="`issue-attribute-${attribute.id}`"
              v-model="attributeValues[attribute.id]"
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
          v-if="error"
          class="form-error">
          {{ error }}
        </p>
        <label>Assignee</label>
        <div class="issue-person issue-assignee">
          <span
            class="avatar"
            :style="{ background: selectedAssignee.color }">
            {{ selectedAssignee.initials }}
          </span>
          <select
            v-model="assigneeId"
            :aria-busy="loadingAssignees"
            :disabled="!viewModel.canEdit"
            @focus="emit('loadAssignees', pickedSpaceId)">
            <option
              v-if="!hasCurrentAssignee"
              :value="viewModel.assigneeId">
              {{ viewModel.assignee }}
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

type IssueDetailsViewModel = {
  assignee: string
  assigneeColor: string
  assigneeId: string
  assigneeInitial: string
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

type IssueDetailsSaveInput = {
  assigneeId: string
  attributeValues: Record<string, string>
  boardId: string
  content: string
  statusId: string
}

type MoveOption = { label: string; value: string }
type AssigneeOption = MoveOption & { color: string; initials: string }

export type IssueDetailsProps = {
  assignees: AssigneeOption[]
  error: null | string
  loadingAssignees: boolean
  loadingMoveBoards: boolean
  loadingMoveSpaces: boolean
  loadingStatuses: boolean
  moveBoards: MoveOption[]
  moveSpaces: MoveOption[]
  saving: boolean
  statuses: Array<{ id: string; name: string }>
  viewModel: IssueDetailsViewModel
}
</script>

<script setup lang="ts">
const props = defineProps<IssueDetailsProps>()
const emit = defineEmits<{
  changeBoard: []
  changeMoveSpace: [spaceId: string]
  dirtyChange: [dirty: boolean]
  loadAssignees: [spaceId: string]
  loadMoveBoards: [spaceId: string]
  loadMoveSpaces: []
  loadStatuses: [boardId: string]
  save: [input: IssueDetailsSaveInput]
}>()
defineSlots<{
  footer?: (props: { canSave: boolean }) => unknown
  header?: () => unknown
  'side-actions'?: (props: { canSave: boolean }) => unknown
}>()

const content = ref(props.viewModel.content)
const assigneeId = ref(props.viewModel.assigneeId)
const boardId = ref(props.viewModel.boardId)
const boardLabel = ref(props.viewModel.boardLabel)
const statusId = ref(props.viewModel.statusId)
const pickedSpaceId = ref(props.viewModel.spaceId)
const spaceLabel = ref(props.viewModel.spaceLabel)
const attributeValues = ref(
  Object.fromEntries(
    props.viewModel.attributes.map((attribute) => [
      attribute.id,
      attribute.value,
    ]),
  ),
)
const spaceOptions = computed(() =>
  props.moveSpaces.filter((space) => space.value !== props.viewModel.spaceId),
)
const boardOptions = computed(() =>
  props.moveBoards.filter(
    (board) =>
      pickedSpaceId.value !== props.viewModel.spaceId ||
      board.value !== props.viewModel.boardId,
  ),
)
const selectedAssignee = computed(
  () =>
    props.assignees.find((assignee) => assignee.value === assigneeId.value) ?? {
      color: props.viewModel.assigneeColor,
      initials: props.viewModel.assigneeInitial,
    },
)
const hasCurrentAssignee = computed(() =>
  props.assignees.some(
    (assignee) => assignee.value === props.viewModel.assigneeId,
  ),
)
const canSave = computed(
  () =>
    !props.saving &&
    !!assigneeId.value &&
    !props.loadingStatuses &&
    (boardId.value === props.viewModel.boardId || !!statusId.value),
)
const dirty = computed(
  () =>
    assigneeId.value !== props.viewModel.assigneeId ||
    boardId.value !== props.viewModel.boardId ||
    content.value !== props.viewModel.content ||
    pickedSpaceId.value !== props.viewModel.spaceId ||
    statusId.value !== props.viewModel.statusId ||
    props.viewModel.attributes.some(
      (attribute) => attributeValues.value[attribute.id] !== attribute.value,
    ),
)

watch(dirty, (value) => emit('dirtyChange', value), { immediate: true })

watch(
  () => props.viewModel,
  (viewModel) => {
    assigneeId.value = viewModel.assigneeId
    content.value = viewModel.content
    boardId.value = viewModel.boardId
    boardLabel.value = viewModel.boardLabel
    pickedSpaceId.value = viewModel.spaceId
    spaceLabel.value = viewModel.spaceLabel
    statusId.value = viewModel.statusId
    attributeValues.value = Object.fromEntries(
      viewModel.attributes.map((attribute) => [attribute.id, attribute.value]),
    )
  },
)

function loadMoveSpaces() {
  if (props.loadingMoveSpaces || props.moveSpaces.length > 0) {
    return
  }
  emit('loadMoveSpaces')
}

function selectMoveSpace() {
  spaceLabel.value =
    props.moveSpaces.find((space) => space.value === pickedSpaceId.value)
      ?.label ?? spaceLabel.value
  boardId.value = ''
  boardLabel.value = ''
  statusId.value = ''
  assigneeId.value = ''
  emit('changeMoveSpace', pickedSpaceId.value)
}

function loadMoveBoards() {
  if (
    !pickedSpaceId.value ||
    props.loadingMoveBoards ||
    props.moveBoards.length > 0
  ) {
    return
  }
  emit('loadMoveBoards', pickedSpaceId.value)
}

function loadStatuses() {
  if (!props.loadingStatuses && props.statuses.length === 0 && boardId.value) {
    emit('loadStatuses', boardId.value)
  }
}

function selectBoard() {
  if (boardId.value === '__loading') {
    return
  }
  const board = props.moveBoards.find((item) => item.value === boardId.value)
  boardLabel.value = board?.label ?? boardLabel.value
  statusId.value = ''
  emit('changeBoard')
}

function formatDate(value: string) {
  return dateTimeFormatter.format(new Date(value))
}

function save() {
  if (!canSave.value) {
    return
  }
  emit('save', {
    assigneeId: assigneeId.value,
    attributeValues: Object.fromEntries(
      Object.entries(attributeValues.value).filter(([, value]) => value),
    ),
    boardId: boardId.value,
    content: content.value,
    statusId: statusId.value,
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

.issue-details--dialog .task-page {
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
  .issue-details--dialog .task-page {
    column-gap: 0;
  }
}
</style>
