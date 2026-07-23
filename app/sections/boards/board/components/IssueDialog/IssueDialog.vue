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
    @cancel.self="handleCancel">
    <IssueDialogSkeleton v-if="!state.hydrated || status === 'idle' || status === 'pending'" />
    <div
      v-else-if="viewModel"
      class="issue-details--dialog">
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
          :class="{ 'issue-copy--copied': state.copied }"
          title="Copy issue link"
          type="button"
          @click="copyIssueLink">
          <Transition
            mode="out-in"
            name="icon-pop">
            <Check
              v-if="state.copied"
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
          @click="close()">
          <X />
        </button>
      </div>
      <IssueDetails
        class="issue-details-form"
        :error="state.error"
        :form-id="formId"
        :lookup="state.lookup"
        :on-can-save-change="setCanSave"
        :on-change-move-board="changeMoveBoard"
        :on-change-move-space="changeMoveSpace"
        :on-dirty-change="setDirty"
        :on-load-assignees="loadAssignees"
        :on-load-move-boards="loadMoveBoards"
        :on-load-move-spaces="loadMoveSpaces"
        :on-load-statuses="loadStatuses"
        :on-reset-lookups="resetLookups"
        :on-save="saveIssue"
        :saving="state.saving"
        :view-model="viewModel" />
      <div class="dialog-actions">
        <button
          v-if="viewModel.canEdit"
          class="secondary danger"
          :disabled="state.saving"
          type="button"
          @click="deleteIssue">
          Delete
        </button>
        <button
          class="secondary"
          :disabled="state.saving"
          type="button"
          @click="close()">
          Cancel
        </button>
        <button
          v-if="viewModel.canEdit"
          class="primary"
          :disabled="!state.canSave"
          :form="formId"
          type="submit">
          {{ state.saving ? 'Saving…' : 'Save changes' }}
        </button>
      </div>
    </div>
    <IssueDialogError
      v-else
      :error-text="loadErrorText"
      :on-close="close"
      :on-retry="refresh" />
  </dialog>
</template>

<script lang="ts">
import type { IssueDetailsSaveInput } from '~/components/issues/issue-details/IssueDetails.vue'
import type { IssueDialogDeps } from '~/sections/boards/board/components/IssueDialog/IssueDialog.deps'

export type IssueDialogSavedIssue = {
  boardId: string
  content: string
  issueKey: string
  previousBoardId: string
  previousStatusId: string
  statusId: string
}

type IssueDialogProps = {
  deps: IssueDialogDeps
  issueKey: string
  onClose: () => void
  onDeleted: (issueKey: string) => void
  onSaved: (issue: IssueDialogSavedIssue) => void
}
</script>

<script setup lang="ts">
import { Check, Link, X } from 'lucide-vue-next'
import { onBeforeRouteUpdate } from 'vue-router'

import IssueDetails from '~/components/issues/issue-details/IssueDetails.vue'
import IssueDialogError from '~/sections/boards/board/components/IssueDialog/components/IssueDialogError.vue'
import IssueDialogSkeleton from '~/sections/boards/board/components/IssueDialog/components/IssueDialogSkeleton.vue'
import type {
  BoardLookupFailure,
  IssueFailure,
  MoveIssueFailure,
  MoveSpacesFailure,
  SpaceLookupFailure,
  UpdateIssueFailure,
} from '~/sections/boards/board/components/IssueDialog/IssueDialog.deps'
import { assertNever } from '~/utils/assertNever'
import { getIssueAttributeValueInput } from '~/utils/issueAttributeValues'

const props = defineProps<IssueDialogProps>()
const route = useRoute('organizations-organizationKey-spaces-spaceKey-boardId')
const organizationRoutes = useOrganizationRoutes()
const router = useRouter()
const dialogEl = ref<HTMLDialogElement>()
const formId = useId()
const state = reactive({
  canSave: false,
  copied: false,
  dirty: false,
  error: null as null | string,
  hydrated: false,
  lookup: {
    assignees: [] as Array<{
      color: string
      initials: string
      label: string
      value: string
    }>,
    boards: [] as Array<{ label: string; value: string }>,
    error: null as null | string,
    loadingAssignees: false,
    loadingMoveBoards: false,
    loadingMoveSpaces: false,
    loadingStatuses: false,
    spaces: [] as Array<{ label: string; value: string }>,
    statuses: [] as Array<{ id: string; name: string }>,
  },
  saving: false,
})

const getLoadIssueFailureMessage = (failure: IssueFailure): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'You do not have access to this issue.'
    case 'issueNotFound':
      return 'The issue was not found or is not available to you.'
    case 'temporarilyUnavailable':
      return 'Could not load issue. The service is temporarily unavailable.'
    default:
      return assertNever(failure)
  }
}

const getAssigneesFailureMessage = (failure: SpaceLookupFailure): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'You do not have access to space members.'
    case 'spaceNotFound':
      return 'The selected space was not found.'
    case 'temporarilyUnavailable':
      return 'Could not load assignees. Try again.'
    default:
      return assertNever(failure)
  }
}

const getMoveSpacesFailureMessage = (failure: MoveSpacesFailure): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'You do not have access to available spaces.'
    case 'temporarilyUnavailable':
      return 'Could not load available spaces.'
    default:
      return assertNever(failure)
  }
}

const getMoveBoardsFailureMessage = (failure: SpaceLookupFailure): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'You do not have access to this space.'
    case 'spaceNotFound':
      return 'This space no longer exists.'
    case 'temporarilyUnavailable':
      return 'Could not load space boards.'
    default:
      return assertNever(failure)
  }
}

const getStatusesFailureMessage = (failure: BoardLookupFailure): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'You do not have access to this board.'
    case 'boardNotFound':
      return 'This board no longer exists.'
    case 'temporarilyUnavailable':
      return 'Could not load board statuses.'
    default:
      return assertNever(failure)
  }
}

const getUpdateFailureMessage = (failure: UpdateIssueFailure): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'You do not have permission to update this issue.'
    case 'invalidInput':
      return failure.message
    case 'issueNotFound':
      return 'The issue was not found.'
    case 'temporarilyUnavailable':
      return 'Could not save issue. Try again.'
    default:
      return assertNever(failure)
  }
}

const getMoveFailureMessage = (failure: MoveIssueFailure): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'You do not have permission to update this issue.'
    case 'invalidStatus':
      return 'Select a valid board status.'
    case 'resourceNotFound':
      return 'The issue or board status was not found.'
    case 'temporarilyUnavailable':
      return 'Could not save issue. Try again.'
    default:
      return assertNever(failure)
  }
}

const getDeleteFailureMessage = (failure: IssueFailure): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'You do not have permission to delete this issue.'
    case 'issueNotFound':
      return 'This issue no longer exists.'
    case 'temporarilyUnavailable':
      return 'Could not delete issue. Try again.'
    default:
      return assertNever(failure)
  }
}

const {
  data: issueOutcome,
  refresh,
  status,
} = await useLazyAsyncData(() => props.deps.loadIssue({ issueKey: props.issueKey }), {
  server: false,
  watch: [() => props.issueKey],
})

const viewModel = computed(() => {
  const result = issueOutcome.value
  if (!result) {
    return null
  }
  return matchResult(result, {
    err: () => null,
    ok: (value) => value.IssueDialog,
  })
})
const loadErrorText = computed(() => {
  const result = issueOutcome.value
  if (!result) {
    return 'Could not load issue. Try again.'
  }
  return matchResult(result, {
    err: getLoadIssueFailureMessage,
    ok: () => 'Could not load issue. Try again.',
  })
})
const issueRoute = computed(() => organizationRoutes.issue(props.issueKey))
const { confirmUnsavedChanges } = useUnsavedChangesWarning(toRef(state, 'dirty'))

useHead({
  title: computed(() => viewModel.value?.issueKey ?? 'Issue'),
})

onMounted(() => {
  showDialog()
  state.hydrated = true
})

onBeforeRouteUpdate(
  (to) => (to.path === route.path && to.query.issue === props.issueKey) || confirmUnsavedChanges(),
)

watch(
  () => props.issueKey,
  () => {
    state.dirty = false
    state.error = null
  },
)

function showDialog() {
  if (dialogEl.value) {
    dialogEl.value.close()
    dialogEl.value.showModal()
    dialogEl.value.focus({ preventScroll: true })
  }
}

function setDirty(dirty: boolean) {
  state.dirty = dirty
}

function setCanSave(canSave: boolean) {
  state.canSave = canSave
}

function changeMoveSpace() {
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

function changeMoveBoard() {
  state.lookup.error = null
  state.lookup.loadingStatuses = false
  state.lookup.statuses = []
}

function resetLookups() {
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

async function loadAssignees(spaceId: string) {
  state.lookup.error = null
  state.lookup.loadingAssignees = true
  const result = await props.deps.issueDetails.loadAssignees({ spaceId })
  state.lookup.loadingAssignees = false
  matchResult(result, {
    err: (error) => {
      state.lookup.error = getAssigneesFailureMessage(error)
    },
    ok: ({ assignees }) => {
      state.lookup.assignees = assignees
    },
  })
}

async function loadMoveSpaces() {
  state.lookup.error = null
  state.lookup.loadingMoveSpaces = true
  const result = await props.deps.issueDetails.loadMoveSpaces()
  state.lookup.loadingMoveSpaces = false
  matchResult(result, {
    err: (error) => {
      state.lookup.error = getMoveSpacesFailureMessage(error)
    },
    ok: ({ spaces }) => {
      state.lookup.spaces = spaces
    },
  })
}

async function loadMoveBoards(spaceId: string) {
  state.lookup.error = null
  state.lookup.loadingMoveBoards = true
  const result = await props.deps.issueDetails.loadMoveBoards({ spaceId })
  state.lookup.loadingMoveBoards = false
  matchResult(result, {
    err: (error) => {
      state.lookup.error = getMoveBoardsFailureMessage(error)
    },
    ok: ({ boards }) => {
      state.lookup.boards = boards
    },
  })
}

async function loadStatuses(boardId: string) {
  state.lookup.error = null
  state.lookup.loadingStatuses = true
  const result = await props.deps.issueDetails.loadStatuses({ boardId })
  state.lookup.loadingStatuses = false
  matchResult(result, {
    err: (error) => {
      state.lookup.error = getStatusesFailureMessage(error)
    },
    ok: ({ statuses }) => {
      state.lookup.statuses = statuses
    },
  })
}

function close(skipWarning = false) {
  if (!skipWarning && !confirmUnsavedChanges()) {
    return
  }
  state.dirty = false
  props.onClose()
}

function handleCancel(event: Event) {
  event.preventDefault()
  close()
}

async function saveIssue(input: IssueDetailsSaveInput) {
  const originalIssue = viewModel.value
  if (!originalIssue) {
    return
  }

  state.saving = true
  state.error = null
  const updateResult = await props.deps.updateIssue({
    assigneeId: input.assigneeId,
    attributeValues: getIssueAttributeValueInput(input.attributeValues, originalIssue.attributes),
    content: input.content,
    files: input.files,
    issueKey: props.issueKey,
    removeAttachmentIds: input.removeAttachmentIds,
  })

  await matchResult(updateResult, {
    err: async (error) => {
      state.error = getUpdateFailureMessage(error)
    },
    ok: async () => {
      if (input.statusId === originalIssue.statusId) {
        props.onSaved({
          boardId: input.boardId,
          content: input.content,
          issueKey: props.issueKey,
          previousBoardId: originalIssue.boardId,
          previousStatusId: originalIssue.statusId,
          statusId: input.statusId,
        })
        close(true)
        return
      }

      const moveResult = await props.deps.moveIssue({
        issueKey: props.issueKey,
        statusId: input.statusId,
      })
      await matchResult(moveResult, {
        err: async (error) => {
          props.onSaved({
            boardId: originalIssue.boardId,
            content: input.content,
            issueKey: props.issueKey,
            previousBoardId: originalIssue.boardId,
            previousStatusId: originalIssue.statusId,
            statusId: originalIssue.statusId,
          })
          await refresh()
          state.error = getMoveFailureMessage(error)
        },
        ok: async () => {
          props.onSaved({
            boardId: input.boardId,
            content: input.content,
            issueKey: props.issueKey,
            previousBoardId: originalIssue.boardId,
            previousStatusId: originalIssue.statusId,
            statusId: input.statusId,
          })
          close(true)
        },
      })
    },
  })
  state.saving = false
}

async function deleteIssue() {
  if (!confirm('Delete this issue?')) {
    return
  }

  state.saving = true
  state.error = null
  const result = await props.deps.deleteIssue({ issueKey: props.issueKey })
  state.saving = false
  matchResult(result, {
    err: (error) => {
      state.error = getDeleteFailureMessage(error)
    },
    ok: () => {
      props.onDeleted(props.issueKey)
      close(true)
    },
  })
}

async function copyIssueLink() {
  const url = new URL(router.resolve(issueRoute.value).href, window.location.origin).href
  try {
    await navigator.clipboard.writeText(url)
  } catch {
    window.prompt('Copy issue link', url)
  }
  state.copied = true
  setTimeout(() => (state.copied = false), 1200)
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
  --issue-dialog-min-height: min(836px, calc(100dvh - var(--space-8) - var(--space-8)));
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
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
}

.issue-dialog::backdrop {
  backdrop-filter: none;
  background: transparent;
  transition: none;
}

.issue-details--dialog {
  display: grid;
  gap: 0;
  grid-template-rows: auto minmax(0, 1fr) auto;
  max-height: calc(100dvh - var(--space-8) - var(--space-8) - var(--space-6) - var(--space-6));
}

.issue-details-form {
  column-gap: var(--space-6);
  min-height: 0;
  overflow: auto;
  padding: var(--space-1);
  scrollbar-gutter: stable;
}

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

    border: 0;
    box-shadow: none;
    height: calc(100dvh - var(--space-2) - var(--space-2));
    inset: var(--space-2);
    margin: 0;
    max-height: none;
    max-width: none;
    min-height: 0;
    padding: var(--space-4);
    width: calc(100% - var(--space-2) - var(--space-2));
  }

  .issue-details--dialog {
    height: 100%;
    max-height: none;
  }

  .issue-details-form {
    column-gap: 0;
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: max-content max-content;
  }

  .dialog-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dialog-actions .danger {
    margin-right: 0;
  }

  .dialog-actions .primary {
    grid-column: 1 / -1;
  }
}
</style>
