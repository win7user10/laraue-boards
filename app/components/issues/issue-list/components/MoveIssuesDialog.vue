<template>
  <dialog ref="dialog">
    <form @submit.prevent="move">
      <h2>
        Move {{ state.issueKeys.length }}
        {{ state.issueKeys.length === 1 ? 'issue' : 'issues' }}
      </h2>
      <label :for="`${idPrefix}-space`">Space</label>
      <select
        :id="`${idPrefix}-space`"
        v-model="state.spaceId"
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
        v-model="state.boardId"
        :disabled="!state.spaceId"
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
        v-model="state.statusId"
        :disabled="!state.boardId"
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
          :disabled="moving || loadingStatuses || !state.statusId">
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
  onChangeBoard: () => void
  onChangeSpace: () => void
  onLoadBoards: (spaceId: string) => void
  onLoadSpaces: () => void
  onLoadStatuses: (boardId: string) => void
  onMove: (input: { issueKeys: string[]; statusId: string }) => void
  spaces: MoveOption[]
  statuses: Array<{ id: string; name: string }>
}
</script>

<script setup lang="ts">
const props = defineProps<MoveIssuesDialogProps>()

const idPrefix = useId()
const dialog = ref<HTMLDialogElement>()
const state = reactive({
  boardId: '',
  issueKeys: [] as string[],
  spaceId: '',
  statusId: '',
})

function open(ids: string[]) {
  state.issueKeys = ids
  state.spaceId = ''
  state.boardId = ''
  state.statusId = ''
  dialog.value?.showModal()
}

function changeSpace() {
  state.boardId = ''
  state.statusId = ''
  props.onChangeSpace()
}

function changeBoard() {
  state.statusId = ''
  props.onChangeBoard()
}

function loadSpaces() {
  if (!props.loadingSpaces && props.spaces.length === 0) {
    props.onLoadSpaces()
  }
}

function loadBoards() {
  if (state.spaceId && !props.loadingBoards && props.boards.length === 0) {
    props.onLoadBoards(state.spaceId)
  }
}

function loadStatuses() {
  if (state.boardId && !props.loadingStatuses && props.statuses.length === 0) {
    props.onLoadStatuses(state.boardId)
  }
}

function move() {
  props.onMove({ issueKeys: state.issueKeys, statusId: state.statusId })
}

watch(
  () => props.moving,
  (moving, wasMoving) => {
    if (wasMoving && !moving && !props.error) {
      dialog.value?.close()
    }
  },
)

defineExpose({ open })
</script>
