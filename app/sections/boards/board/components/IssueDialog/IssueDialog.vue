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
        :deps="deps.issueDetails"
        :form-id="formId"
        :on-can-save-change="setCanSave"
        :on-dirty-change="setDirty"
        :on-saved="handleIssueSaved"
        :on-saving-change="setSaving"
        :view-model="viewModel" />
      <div class="dialog-actions">
        <p
          v-if="state.actionError"
          class="form-error dialog-action-error">
          {{ state.actionError }}
        </p>
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

<script setup lang="ts">
import { Check, Link, X } from 'lucide-vue-next'
import { onBeforeRouteUpdate } from 'vue-router'

import type { IssueDetailsSavedIssue } from '~/components/issues/issue-details/deps'
import IssueDetails from '~/components/issues/issue-details/IssueDetails.vue'
import IssueDialogError from '~/sections/boards/board/components/IssueDialog/components/IssueDialogError.vue'
import IssueDialogSkeleton from '~/sections/boards/board/components/IssueDialog/components/IssueDialogSkeleton.vue'
import { assertNever } from '~/utils/assertNever'

import type { IssueDialogDeps, IssueFailure } from './IssueDialog.deps'

const props = defineProps<{
  deps: IssueDialogDeps
  issueKey: string
  onClose: () => void
  onDeleted: (issueKey: string) => void
  onSaved: (issue: IssueDetailsSavedIssue) => void
}>()
const route = useRoute('organizations-organizationKey-spaces-spaceKey-boardId')
const organizationRoutes = useOrganizationRoutes()
const router = useRouter()
const dialogEl = ref<HTMLDialogElement>()
const formId = useId()
const state = reactive({
  actionError: null as null | string,
  canSave: false,
  copied: false,
  dirty: false,
  hydrated: false,
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
  return result?.ok ? result.value.IssueDialog : null
})
const loadErrorText = computed(() => {
  const result = issueOutcome.value
  return result && !result.ok
    ? getLoadIssueFailureMessage(result.error)
    : 'Could not load issue. Try again.'
})
const issueRoute = computed(() => organizationRoutes.issue(props.issueKey))
const { confirmUnsavedChanges } = useUnsavedChangesWarning(toRef(state, 'dirty'))

useHead({
  title: computed(() => viewModel.value?.issueKey ?? 'Issue'),
})

const showDialog = () => {
  if (dialogEl.value) {
    dialogEl.value.close()
    dialogEl.value.showModal()
    dialogEl.value.focus({ preventScroll: true })
  }
}

const setDirty = (dirty: boolean) => {
  state.dirty = dirty
}

const setCanSave = (canSave: boolean) => {
  state.canSave = canSave
}

const setSaving = (saving: boolean) => {
  state.saving = saving
}

const close = (skipWarning = false) => {
  if (!skipWarning && !confirmUnsavedChanges()) {
    return
  }
  state.dirty = false
  props.onClose()
}

const handleCancel = (event: Event) => {
  event.preventDefault()
  close()
}

const handleIssueSaved = async (issue: IssueDetailsSavedIssue) => {
  props.onSaved(issue)
  if (issue.complete) {
    close(true)
    return
  }
  await refresh()
}

const deleteIssue = async () => {
  if (!confirm('Delete this issue?')) {
    return
  }

  state.saving = true
  state.actionError = null
  const result = await props.deps.deleteIssue({ issueKey: props.issueKey })
  state.saving = false
  if (!result.ok) {
    state.actionError = 'Could not delete issue. Try again.'
    return
  }
  props.onDeleted(props.issueKey)
  close(true)
}

const copyIssueLink = async () => {
  const url = new URL(router.resolve(issueRoute.value).href, window.location.origin).href
  try {
    await navigator.clipboard.writeText(url)
  } catch {
    window.prompt('Copy issue link', url)
  }
  state.copied = true
  setTimeout(() => (state.copied = false), 1200)
}

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
    state.actionError = null
    state.dirty = false
  },
)
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
  flex-wrap: wrap;
  margin-top: 0;
  padding-top: var(--space-4);
}

.dialog-action-error {
  flex-basis: 100%;
  margin-top: 0;
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
