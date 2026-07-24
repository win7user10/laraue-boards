<template>
  <dialog ref="dialog">
    <form @submit.prevent="move">
      <h2>
        Move {{ state.issueKeys.length }}
        {{ state.issueKeys.length === 1 ? 'issue' : 'issues' }}
      </h2>
      <label :for="`${idPrefix}-space`">Space</label>
      <SpaceSelect
        :id="`${idPrefix}-space`"
        v-model="state.spaceId"
        :deps="deps.spaceSelect"
        :disabled="state.moving"
        required />
      <label :for="`${idPrefix}-board`">Board</label>
      <BoardSelect
        :id="`${idPrefix}-board`"
        v-model="state.boardId"
        :deps="deps.boardSelect"
        :disabled="state.moving"
        :excluded-value="excludedBoardId"
        required
        :space-id="state.spaceId" />
      <label :for="`${idPrefix}-status`">Column</label>
      <StatusSelect
        :id="`${idPrefix}-status`"
        v-model="state.statusId"
        :board-id="state.boardId"
        :deps="deps.statusSelect"
        :disabled="state.moving"
        placeholder="Select column"
        required />
      <p
        v-if="state.error"
        class="form-error">
        {{ state.error }}
      </p>
      <div class="dialog-actions">
        <button
          class="secondary"
          :disabled="state.moving"
          type="button"
          @click="dialog?.close()">
          Cancel
        </button>
        <button
          class="primary"
          :disabled="state.moving || !state.statusId">
          {{ state.moving ? 'Moving…' : 'Move' }}
        </button>
      </div>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import BoardSelect from '~/components/board-select/BoardSelect.vue'
import SpaceSelect from '~/components/space-select/SpaceSelect.vue'
import StatusSelect from '~/components/status-select/StatusSelect.vue'

import type { MoveIssuesDialogDeps } from './deps'

const props = defineProps<{
  deps: MoveIssuesDialogDeps
  excludedBoardId?: string
  onMoved: () => Promise<void> | void
}>()

const idPrefix = useId()
const dialog = ref<HTMLDialogElement>()
const state = reactive({
  boardId: '',
  error: null as null | string,
  issueKeys: [] as string[],
  moving: false,
  spaceId: '',
  statusId: '',
})

const open = (issueKeys: string[]) => {
  Object.assign(state, {
    boardId: '',
    error: null,
    issueKeys,
    moving: false,
    spaceId: '',
    statusId: '',
  })
  dialog.value?.showModal()
}

const move = async () => {
  if (state.moving || !state.statusId) {
    return
  }

  state.error = null
  state.moving = true
  const result = await props.deps.moveIssues({
    issueKeys: state.issueKeys,
    statusId: state.statusId,
  })
  if (!result.ok) {
    state.error = 'Could not move some issues. Try again.'
    state.moving = false
    return
  }

  await props.onMoved()
  state.moving = false
  dialog.value?.close()
}

watch(
  () => [state.spaceId, state.boardId, state.statusId],
  () => {
    state.error = null
  },
)

defineExpose({ open })
</script>
