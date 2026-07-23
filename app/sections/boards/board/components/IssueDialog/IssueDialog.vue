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
    <IssueDialogSkeleton
      v-if="!state.hydrated || status === 'idle' || status === 'pending'" />
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
import type {
  IssueDetailsSaveInput,
  IssueDetailsViewModel,
} from '~/components/issues/issue-details/IssueDetails.vue'
import type { BoardPageDeps } from '~/sections/boards/board/BoardPage.deps'

export type IssueDialogViewModel = IssueDetailsViewModel

export type IssueDialogSavedIssue = {
  boardId: string
  content: string
  issueKey: string
  previousBoardId: string
  previousStatusId: string
  statusId: string
}

type IssueDialogProps = {
  deleteIssue: BoardPageDeps['issueDialog']['deleteIssue']
  issueKey: string
  loadAssignees: BoardPageDeps['issueDialog']['issueDetails']['loadAssignees']
  loadIssue: BoardPageDeps['issueDialog']['loadIssue']
  loadMoveBoards: BoardPageDeps['issueDialog']['issueDetails']['loadMoveBoards']
  loadMoveSpaces: BoardPageDeps['issueDialog']['issueDetails']['loadMoveSpaces']
  loadStatuses: BoardPageDeps['issueDialog']['issueDetails']['loadStatuses']
  moveIssue: BoardPageDeps['issueDialog']['moveIssue']
  onClose: () => void
  onDeleted: (issueKey: string) => void
  onSaved: (issue: IssueDialogSavedIssue) => void
  updateIssue: BoardPageDeps['issueDialog']['updateIssue']
}
</script>

<script setup lang="ts">
import { Check, Link, X } from 'lucide-vue-next'
import { onBeforeRouteUpdate } from 'vue-router'

import IssueDetails from '~/components/issues/issue-details/IssueDetails.vue'
import IssueDialogError from '~/sections/boards/board/components/IssueDialog/components/IssueDialogError.vue'
import IssueDialogSkeleton from '~/sections/boards/board/components/IssueDialog/components/IssueDialogSkeleton.vue'
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

const {
  data: issueOutcome,
  refresh,
  status,
} = await useLazyAsyncData(
  () => props.loadIssue({ issueKey: props.issueKey }),
  { server: false, watch: [() => props.issueKey] },
)

const viewModel = computed(() => {
  const result = issueOutcome.value
  if (!result) {
    return null
  }
  return matchActionResult({
    err: () => null,
    ok: (value) => value.IssueDialog,
    result,
  })
})
const loadErrorText = computed(() => {
  const result = issueOutcome.value
  if (!result) {
    return 'Could not load issue. Try again.'
  }
  return matchActionResult({
    err: (error) =>
      getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have access to this issue.',
          IssueNotFound: 'The issue was not found or is not available to you.',
          TemporarilyUnavailable:
            'Could not load issue. The service is temporarily unavailable.',
        },
      }),
    ok: () => 'Could not load issue. Try again.',
    result,
  })
})
const issueRoute = computed(() => organizationRoutes.issue(props.issueKey))
const { confirmUnsavedChanges } = useUnsavedChangesWarning(
  toRef(state, 'dirty'),
)

useHead({
  title: computed(() => viewModel.value?.issueKey ?? 'Issue'),
})

onMounted(() => {
  showDialog()
  state.hydrated = true
})

onBeforeRouteUpdate(
  (to) =>
    (to.path === route.path && to.query.issue === props.issueKey) ||
    confirmUnsavedChanges(),
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
  const result = await props.loadAssignees({ spaceId })
  state.lookup.loadingAssignees = false
  matchActionResult({
    err: (error) => {
      state.lookup.error = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have access to space members.',
          SpaceNotFound: 'The selected space was not found.',
          TemporarilyUnavailable: 'Could not load assignees. Try again.',
        },
      })
    },
    ok: ({ assignees }) => {
      state.lookup.assignees = assignees
    },
    result,
  })
}

async function loadMoveSpaces() {
  state.lookup.error = null
  state.lookup.loadingMoveSpaces = true
  const result = await props.loadMoveSpaces()
  state.lookup.loadingMoveSpaces = false
  matchActionResult({
    err: (error) => {
      state.lookup.error = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have access to available spaces.',
          TemporarilyUnavailable: 'Could not load available spaces.',
        },
      })
    },
    ok: ({ spaces }) => {
      state.lookup.spaces = spaces
    },
    result,
  })
}

async function loadMoveBoards(spaceId: string) {
  state.lookup.error = null
  state.lookup.loadingMoveBoards = true
  const result = await props.loadMoveBoards({ spaceId })
  state.lookup.loadingMoveBoards = false
  matchActionResult({
    err: (error) => {
      state.lookup.error = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have access to this space.',
          SpaceNotFound: 'This space no longer exists.',
          TemporarilyUnavailable: 'Could not load space boards.',
        },
      })
    },
    ok: ({ boards }) => {
      state.lookup.boards = boards
    },
    result,
  })
}

async function loadStatuses(boardId: string) {
  state.lookup.error = null
  state.lookup.loadingStatuses = true
  const result = await props.loadStatuses({ boardId })
  state.lookup.loadingStatuses = false
  matchActionResult({
    err: (error) => {
      state.lookup.error = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have access to this board.',
          BoardNotFound: 'This board no longer exists.',
          TemporarilyUnavailable: 'Could not load board statuses.',
        },
      })
    },
    ok: ({ statuses }) => {
      state.lookup.statuses = statuses
    },
    result,
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
  const updateResult = await props.updateIssue({
    assigneeId: input.assigneeId,
    attributeValues: getIssueAttributeValueInput(
      input.attributeValues,
      originalIssue.attributes,
    ),
    content: input.content,
    files: input.files,
    issueKey: props.issueKey,
    removeAttachmentIds: input.removeAttachmentIds,
  })

  await matchActionResult({
    err: async (error) => {
      state.error = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have permission to update this issue.',
          IssueNotFound: 'The issue was not found.',
          TemporarilyUnavailable: 'Could not save issue. Try again.',
        },
      })
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

      const moveResult = await props.moveIssue({
        issueKey: props.issueKey,
        statusId: input.statusId,
      })
      await matchActionResult({
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
          state.error = getErrorMessage({
            error,
            messages: {
              AccessDenied: 'You do not have permission to update this issue.',
              InvalidStatus: 'Select a valid board status.',
              ResourceNotFound: 'The issue or board status was not found.',
              TemporarilyUnavailable: 'Could not save issue. Try again.',
            },
          })
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
        result: moveResult,
      })
    },
    result: updateResult,
  })
  state.saving = false
}

async function deleteIssue() {
  if (!confirm('Delete this issue?')) {
    return
  }

  state.saving = true
  state.error = null
  const result = await props.deleteIssue({ issueKey: props.issueKey })
  state.saving = false
  matchActionResult({
    err: (error) => {
      state.error = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have permission to delete this issue.',
          IssueNotFound: 'This issue no longer exists.',
          TemporarilyUnavailable: 'Could not delete issue. Try again.',
        },
      })
    },
    ok: () => {
      props.onDeleted(props.issueKey)
      close(true)
    },
    result,
  })
}

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
  max-height: calc(
    100dvh - var(--space-8) - var(--space-8) - var(--space-6) - var(--space-6)
  );
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
