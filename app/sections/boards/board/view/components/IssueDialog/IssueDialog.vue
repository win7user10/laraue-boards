<template>
  <div
    aria-hidden="true"
    class="issue-dialog-overlay" />
  <dialog
    ref="dialogEl"
    aria-label="Issue details"
    class="issue-dialog"
    open
    tabindex="-1"
    @cancel="handleCancel">
    <IssueDialogSkeleton v-if="!hydrated || loading" />
    <IssueDialogContent
      v-else-if="viewModel"
      :assignees="assignees"
      :error="error"
      :loading-assignees="loadingAssignees"
      :loading-move-boards="loadingMoveBoards"
      :loading-move-spaces="loadingMoveSpaces"
      :loading-statuses="loadingStatuses"
      :move-boards="moveBoards"
      :move-spaces="moveSpaces"
      :saving="saving"
      :statuses="statuses"
      :view-model="viewModel"
      @change-board="emit('changeBoard')"
      @change-move-space="emit('changeMoveSpace', $event)"
      @close="emit('close')"
      @delete="emit('delete')"
      @load-assignees="emit('loadAssignees', $event)"
      @load-move-boards="emit('loadMoveBoards', $event)"
      @load-move-spaces="emit('loadMoveSpaces')"
      @load-statuses="emit('loadStatuses', $event)"
      @save="emit('save', $event)" />
    <IssueDialogError
      v-else
      :error-text="loadErrorText"
      @close="emit('close')"
      @retry="emit('retry')" />
  </dialog>
</template>

<script lang="ts">
export type IssueDialogViewModel =
  import('./components/IssueDialogContent.vue').IssueDialogViewModel

type MoveOption = { label: string; value: string }

type IssueDialogProps = {
  assignees: MoveOption[]
  error: null | string
  loadErrorText: string
  loading: boolean
  loadingAssignees: boolean
  loadingMoveBoards: boolean
  loadingMoveSpaces: boolean
  loadingStatuses: boolean
  moveBoards: MoveOption[]
  moveSpaces: MoveOption[]
  saving: boolean
  statuses: Array<{ id: string; name: string }>
  viewModel: IssueDialogViewModel | null
}
</script>

<script setup lang="ts">
import IssueDialogContent from './components/IssueDialogContent.vue'
import IssueDialogError from './components/IssueDialogError.vue'
import IssueDialogSkeleton from './components/IssueDialogSkeleton.vue'

defineProps<IssueDialogProps>()
const emit = defineEmits<{
  changeBoard: []
  changeMoveSpace: [spaceId: string]
  close: []
  delete: []
  loadAssignees: [spaceId: string]
  loadMoveBoards: [spaceId: string]
  loadMoveSpaces: []
  loadStatuses: [boardId: string]
  retry: []
  save: [
    input: {
      assigneeId: string
      attributeValues: Record<string, string>
      boardId: string
      content: string
      statusId: string
    },
  ]
}>()
const dialogEl = ref<HTMLDialogElement>()
const hydrated = ref(false)

onMounted(() => {
  showDialog()
  hydrated.value = true
})

function showDialog() {
  if (dialogEl.value) {
    dialogEl.value.close()
    dialogEl.value.showModal()
    dialogEl.value.focus({ preventScroll: true })
  }
}

function handleCancel(event: Event) {
  event.preventDefault()
  emit('close')
}
</script>

<style scoped>
.issue-dialog-overlay {
  backdrop-filter: blur(1px);
  background: #00000082;
  inset: 0;
  opacity: 1;
  position: fixed;
  transition: opacity var(--duration-base) var(--ease-standard);
  z-index: 1000;
}

.issue-dialog {
  --issue-dialog-min-height: min(
    836px,
    calc(100dvh - var(--space-8) - var(--space-8))
  );
  --issue-dialog-padding-block: var(--space-6);

  inset: var(--space-8) 0 auto;
  margin: 0 auto;
  max-height: calc(100dvh - var(--space-8) - var(--space-8));
  min-height: var(--issue-dialog-min-height);
  outline: none;
  overflow: hidden;
  padding-block: var(--issue-dialog-padding-block);
  position: fixed;
  transition: none;
  width: min(980px, calc(100% - var(--space-8)));
  z-index: 1001;
}

.issue-dialog[open] {
  display: grid;
  grid-template-rows: minmax(0, 1fr);
}

.issue-dialog::backdrop {
  backdrop-filter: none;
  background: transparent;
  transition: none;
}

@starting-style {
  .issue-dialog-overlay {
    opacity: 0;
  }

  .issue-dialog[open] {
    opacity: 1;
    scale: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .issue-dialog-overlay {
    transition: none;
  }
}

@media (max-width: 760px) {
  .issue-dialog {
    --issue-dialog-padding-block: var(--space-4);
  }
}
</style>
