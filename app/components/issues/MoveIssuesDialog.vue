<template>
  <dialog ref="dialog">
    <form @submit.prevent="move">
      <h2>
        Move {{ issueKeys.length }}
        {{ issueKeys.length === 1 ? 'issue' : 'issues' }}
      </h2>
      <label :for="`${idPrefix}-space`">Space</label>
      <select
        :id="`${idPrefix}-space`"
        v-model="spaceId"
        required
        @change="changeSpace"
        @focus="loadSpaces">
        <option
          disabled
          value="">
          Select space
        </option>
        <option
          v-if="loadingSpaces"
          disabled
          value="__loading">
          Loading spaces…
        </option>
        <option
          v-for="space in spaces"
          :key="space.value"
          :value="space.value">
          {{ space.label }}
        </option>
      </select>
      <label :for="`${idPrefix}-board`">Board</label>
      <select
        :id="`${idPrefix}-board`"
        v-model="boardId"
        :disabled="!spaceId"
        required
        @change="changeBoard"
        @focus="loadBoards">
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
          v-for="board in boards"
          :key="board.value"
          :value="board.value">
          {{ board.label }}
        </option>
      </select>
      <label :for="`${idPrefix}-status`">Column</label>
      <select
        :id="`${idPrefix}-status`"
        v-model="statusId"
        :disabled="!boardId"
        required
        @focus="loadStatuses">
        <option
          disabled
          value="">
          Select column
        </option>
        <option
          v-if="loadingStatuses"
          disabled
          value="__loading">
          Loading columns…
        </option>
        <option
          v-else-if="statuses.length === 0"
          disabled
          value="__empty">
          No columns available
        </option>
        <option
          v-for="status in statuses"
          :key="status.id"
          :value="status.id">
          {{ status.name }}
        </option>
      </select>
      <p
        v-if="error"
        class="form-error">
        {{ error }}
      </p>
      <div class="dialog-actions">
        <button
          class="secondary"
          :disabled="moving"
          type="button"
          @click="dialog?.close()">
          Cancel
        </button>
        <button
          class="primary"
          :disabled="moving || loadingStatuses || !statusId">
          {{ moving ? 'Moving…' : 'Move' }}
        </button>
      </div>
    </form>
  </dialog>
</template>

<script lang="ts">
type MoveOption = { label: string; value: string }

export type MoveIssuesDialogProps = {
  boards: MoveOption[]
  error: null | string
  loadingBoards: boolean
  loadingSpaces: boolean
  loadingStatuses: boolean
  moving: boolean
  spaces: MoveOption[]
  statuses: Array<{ id: string; name: string }>
}
</script>

<script setup lang="ts">
const props = defineProps<MoveIssuesDialogProps>()
const emit = defineEmits<{
  changeBoard: []
  changeSpace: []
  loadBoards: [spaceId: string]
  loadSpaces: []
  loadStatuses: [boardId: string]
  move: [input: { issueKeys: string[]; statusId: string }]
  moved: []
}>()

const idPrefix = useId()
const dialog = ref<HTMLDialogElement>()
const issueKeys = ref<string[]>([])
const spaceId = ref('')
const boardId = ref('')
const statusId = ref('')

function open(ids: string[]) {
  issueKeys.value = ids
  spaceId.value = ''
  boardId.value = ''
  statusId.value = ''
  dialog.value?.showModal()
}

function changeSpace() {
  boardId.value = ''
  statusId.value = ''
  emit('changeSpace')
}

function changeBoard() {
  statusId.value = ''
  emit('changeBoard')
}

function loadSpaces() {
  if (!props.loadingSpaces && props.spaces.length === 0) {
    emit('loadSpaces')
  }
}

function loadBoards() {
  if (spaceId.value && !props.loadingBoards && props.boards.length === 0) {
    emit('loadBoards', spaceId.value)
  }
}

function loadStatuses() {
  if (boardId.value && !props.loadingStatuses && props.statuses.length === 0) {
    emit('loadStatuses', boardId.value)
  }
}

function move() {
  emit('move', { issueKeys: issueKeys.value, statusId: statusId.value })
}

watch(
  () => props.moving,
  (moving, wasMoving) => {
    if (wasMoving && !moving && !props.error) {
      dialog.value?.close()
      emit('moved')
    }
  },
)

defineExpose({ open })
</script>
