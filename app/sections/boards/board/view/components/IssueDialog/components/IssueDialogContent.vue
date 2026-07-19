<template>
  <IssueDetails
    :assignees="assignees"
    class="issue-details--dialog"
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
    @load-assignees="emit('loadAssignees', $event)"
    @load-move-boards="emit('loadMoveBoards', $event)"
    @load-move-spaces="emit('loadMoveSpaces')"
    @load-statuses="emit('loadStatuses', $event)"
    @save="emit('save', $event)">
    <template #header>
      <div class="issue-dialog-header">
        <h2>
          <NuxtLink
            rel="noopener"
            target="_blank"
            :to="issueRoute">
            {{ viewModel.issueKey }}
          </NuxtLink>
        </h2>
        <button
          aria-label="Copy issue link"
          class="issue-copy"
          :class="{ 'issue-copy--copied': copied }"
          title="Copy issue link"
          type="button"
          @click="copyIssueLink">
          <Transition
            mode="out-in"
            name="icon-pop">
            <Check
              v-if="copied"
              key="check" />
            <Link
              v-else
              key="link" />
          </Transition>
        </button>
        <button
          aria-label="Close dialog"
          class="icon-btn issue-close"
          title="Close dialog"
          type="button"
          @click="emit('close')">
          <X />
        </button>
      </div>
    </template>
    <template #footer="{ canSave }">
      <div class="dialog-actions">
        <button
          v-if="viewModel.canEdit"
          class="secondary danger"
          :disabled="saving"
          type="button"
          @click="emit('delete')">
          Delete
        </button>
        <button
          class="secondary"
          :disabled="saving"
          type="button"
          @click="emit('close')">
          Cancel
        </button>
        <button
          v-if="viewModel.canEdit"
          class="primary"
          :disabled="!canSave"
          type="submit">
          {{ saving ? 'Saving…' : 'Save changes' }}
        </button>
      </div>
    </template>
  </IssueDetails>
</template>

<script lang="ts">
export type IssueDialogAttributeViewModel =
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

export type IssueDialogViewModel = {
  assignee: string
  assigneeColor: string
  assigneeId: string
  assigneeInitial: string
  attributes: IssueDialogAttributeViewModel[]
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

type IssueDialogSaveInput = {
  assigneeId: string
  attributeValues: Record<string, string>
  boardId: string
  content: string
  statusId: string
}

type MoveOption = { label: string; value: string }
type AssigneeOption = MoveOption & { color: string; initials: string }

type IssueDialogContentProps = {
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
  viewModel: IssueDialogViewModel
}
</script>

<script setup lang="ts">
import { Check, Link, X } from 'lucide-vue-next'

import IssueDetails from '~/components/issues/IssueDetails.vue'

const props = defineProps<IssueDialogContentProps>()
const emit = defineEmits<{
  changeBoard: []
  changeMoveSpace: [spaceId: string]
  close: []
  delete: []
  loadAssignees: [spaceId: string]
  loadMoveBoards: [spaceId: string]
  loadMoveSpaces: []
  loadStatuses: [boardId: string]
  save: [input: IssueDialogSaveInput]
}>()
const organizationRoutes = useOrganizationRoutes()
const router = useRouter()
const issueRoute = computed(() =>
  organizationRoutes.issue(props.viewModel.issueKey),
)
const copied = ref(false)

async function copyIssueLink() {
  const url = new URL(
    router.resolve(issueRoute.value).href,
    window.location.origin,
  ).href
  try {
    await navigator.clipboard.writeText(url)
  } catch {
    window.prompt('Copy issue link', url)
  }
  copied.value = true
  setTimeout(() => (copied.value = false), 1200)
}
</script>

<style scoped>
.issue-dialog-header {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  padding-bottom: var(--space-4);
}

.issue-copy {
  background: transparent;
  border: 0;
  color: var(--color-muted);
  display: inline-flex;
  padding: 0;
  transition: var(--transition-press);
}

.issue-copy:hover {
  color: var(--color-text);
}

.issue-copy:active {
  translate: 0 var(--press-offset);
}

.issue-copy--copied {
  color: var(--color-success);
}

.issue-close {
  margin-left: auto;
}

.issue-dialog-header a {
  color: inherit;
  text-decoration: none;
}

.issue-dialog-header a:hover {
  color: var(--color-accent);
}

.danger {
  margin-right: auto;
}

.dialog-actions {
  margin-top: 0;
  padding-top: var(--space-4);
}
</style>
