<template>
  <PageState
    error-title="Could not load backlog issue form"
    loading-text="Loading backlog issue form…"
    :on-retry="query.refresh"
    :state="pageState">
    <template #default="{ data }">
      <section>
        <div class="title-row">
          <div class="page-heading">
            <AppBackLink
              label="Back to backlog"
              :to="organizationRoutes.backlog(spaceKey)" />
            <ListPlus class="page-heading-icon" />
            <div class="page-heading-text"><h1>Add backlog issue</h1></div>
          </div>
        </div>
        <form
          class="issue-form"
          @submit.prevent="submit">
          <div class="issue-form-main">
            <label for="create-backlog-issue-content">Issue text</label>
            <textarea
              id="create-backlog-issue-content"
              v-model="state.content"
              placeholder="What needs attention?"
              required
              rows="10" />
            <IssueAttachments
              :attachments="[]"
              :disabled="state.submitting"
              :files="state.files"
              :on-change="changeFiles" />
          </div>
          <div class="issue-form-side">
            <label>Board</label>
            <div class="selected-entity">{{ data.boardName }}</div>

            <label for="create-backlog-issue-status">Status</label>
            <select
              id="create-backlog-issue-status"
              v-model="state.statusId"
              :disabled="data.statuses.length === 0"
              required>
              <option
                disabled
                value="">
                {{
                  data.statuses.length === 0
                    ? 'No statuses available'
                    : 'Select status'
                }}
              </option>
              <option
                v-for="status in data.statuses"
                :key="status.value"
                :value="status.value">
                {{ status.label }}
              </option>
            </select>

            <IssueAttributeFields
              v-model="state.attributeValues"
              :attributes="data.attributes" />

            <label for="create-backlog-issue-assignee">Assignee</label>
            <div class="issue-assignee">
              <span
                class="avatar"
                :style="{ background: assignee?.color }">
                {{ assignee?.initials ?? '?' }}
              </span>
              <select
                id="create-backlog-issue-assignee"
                v-model="state.assigneeId"
                required
                @focus="loadAssignees">
                <option
                  disabled
                  value="">
                  Select assignee
                </option>
                <option
                  v-if="state.loadingAssignees"
                  disabled
                  value="__loading">
                  Loading assignees…
                </option>
                <option
                  v-for="option in state.assignees"
                  :key="option.value"
                  :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>

            <p
              v-if="state.error"
              class="form-error">
              {{ state.error }}
            </p>
            <div class="page-actions">
              <button
                class="primary"
                :disabled="
                  state.submitting || !state.statusId || !state.assigneeId
                ">
                {{ state.submitting ? 'Adding…' : 'Add issue' }}
              </button>
            </div>
          </div>
        </form>
      </section>
    </template>
  </PageState>
</template>

<script setup lang="ts">
import { ListPlus } from 'lucide-vue-next'

import IssueAttachments from '~/components/issues/IssueAttachments.vue'
import IssueAttributeFields from '~/components/issues/IssueAttributeFields.vue'
import type {
  BacklogIssueAssignee,
  CreateBacklogIssueFailure,
  CreateBacklogIssuePageDeps,
  LoadBacklogAssigneesFailure,
  ViewBacklogIssueFailure,
} from '~/sections/spaces/create-backlog-issue/CreateBacklogIssuePage.deps'
import { matchResult } from '~/utils/actionResult'
import { assertNever } from '~/utils/assertNever'
import { toAsyncResultState } from '~/utils/asyncResultState'
import { getIssueAttributeValueInput } from '~/utils/issueAttributeValues'

const props = defineProps<{
  deps: CreateBacklogIssuePageDeps
  onCreated: (issueKey: string) => Promise<void> | void
  spaceKey: string
}>()
const organizationRoutes = useOrganizationRoutes()
const state = reactive({
  assigneeId: '',
  assignees: [] as BacklogIssueAssignee[],
  attributeValues: {} as Record<string, string>,
  content: '',
  error: null as null | string,
  files: [] as File[],
  loadingAssignees: false,
  statusId: '',
  submitting: false,
})

useHead({ title: 'Add backlog issue' })
const query = await useAsyncData(
  () => `create-backlog-issue:${props.spaceKey}`,
  (_nuxtApp, { signal }) =>
    props.deps.view({ signal, spaceKey: props.spaceKey }),
  { watch: [() => props.spaceKey] },
)
const getViewFailureMessage = (failure: ViewBacklogIssueFailure): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'You do not have permission to add backlog issues.'
    case 'backlogNotFound':
      return 'The backlog was not found or is not available to you.'
    case 'spaceNotFound':
      return 'The space was not found or is not available to you.'
    case 'temporarilyUnavailable':
      return 'Could not load backlog issue form. The service is temporarily unavailable.'
    default:
      return assertNever(failure)
  }
}
const pageState = computed(() =>
  toAsyncResultState({
    error: query.error.value,
    getErrorMessage: getViewFailureMessage,
    result: query.data.value,
    status: query.status.value,
  }),
)
const page = computed(() =>
  pageState.value.type === 'ready' ? pageState.value.data : null,
)
const assignee = computed(() =>
  state.assignees.find((option) => option.value === state.assigneeId),
)

const getLoadFailureMessage = (
  failure: LoadBacklogAssigneesFailure,
): string => {
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

const getCreateFailureMessage = (
  failure: CreateBacklogIssueFailure,
): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'You do not have permission to add this issue.'
    case 'invalidInput':
      return failure.message
    case 'statusNotFound':
      return 'The selected status was not found.'
    case 'temporarilyUnavailable':
      return 'Could not add issue. Try again.'
    default:
      return assertNever(failure)
  }
}

async function loadAssignees(): Promise<void> {
  const current = page.value
  if (!current || state.loadingAssignees || state.assignees.length) {
    return
  }
  state.error = null
  state.loadingAssignees = true
  try {
    const result = await props.deps.loadAssignees({
      spaceId: current.spaceId,
    })
    matchResult(result, {
      err: (failure) => (state.error = getLoadFailureMessage(failure)),
      ok: (assignees) => (state.assignees = assignees),
    })
  } finally {
    state.loadingAssignees = false
  }
}

function changeFiles(files: File[]): void {
  state.files = files
}

async function submit(): Promise<void> {
  const current = page.value
  if (!current || state.submitting) {
    return
  }
  state.error = null
  state.submitting = true
  try {
    const result = await props.deps.create({
      assigneeId: state.assigneeId,
      attributeValues: getIssueAttributeValueInput(
        state.attributeValues,
        current.attributes,
      ),
      content: state.content.trim(),
      files: state.files,
      statusId: state.statusId,
    })
    await matchResult(result, {
      err: (failure) => (state.error = getCreateFailureMessage(failure)),
      ok: ({ issueKey }) => props.onCreated(issueKey),
    })
  } finally {
    state.submitting = false
  }
}
</script>

<style scoped>
.selected-entity {
  align-items: center;
  background: var(--color-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  display: flex;
  min-height: var(--control-height);
  padding: 0 var(--space-3);
}

.issue-assignee {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  min-height: var(--control-height);
}

.issue-assignee .avatar {
  font-size: var(--font-size-caption);
  height: 28px;
  width: 28px;
}

.issue-assignee select {
  flex: 1;
  min-width: 0;
}
</style>
