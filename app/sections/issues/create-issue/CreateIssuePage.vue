<template>
  <PageState
    error-title="Could not load issue form"
    loading-text="Loading issue form…"
    :on-retry="query.refresh"
    :state="pageState">
    <template #default="{ data }">
      <section>
        <div class="title-row">
          <div class="page-heading">
            <AppBackLink
              label="Back to issues"
              :to="organizationRoutes.issues()" />
            <ListPlus class="page-heading-icon" />
            <div class="page-heading-text">
              <h1>Add issue</h1>
            </div>
          </div>
        </div>
        <form
          class="issue-form"
          @submit.prevent="submitForm">
          <div class="issue-form-main">
            <label for="create-issue-content">Issue text</label>
            <textarea
              id="create-issue-content"
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
            <label for="create-issue-space">Space</label>
            <select
              id="create-issue-space"
              v-model="state.spaceId"
              :disabled="state.loadingBoards || data.spaces.length === 0"
              required
              @change="changeSelectedSpace">
              <option
                v-if="data.spaces.length === 0"
                disabled
                value="">
                No spaces available
              </option>
              <option
                v-for="space in data.spaces"
                :key="space.value"
                :value="space.value">
                {{ space.label }}
              </option>
            </select>

            <label for="create-issue-board">Board</label>
            <select
              id="create-issue-board"
              v-model="state.boardId"
              :disabled="!state.spaceId"
              required
              @change="changeBoard(state.boardId)"
              @focus="loadBoards(state.spaceId)">
              <option
                disabled
                value="">
                Select board
              </option>
              <option
                v-if="state.loadingBoards"
                disabled
                value="__loading">
                Loading boards…
              </option>
              <option
                v-for="board in data.boards"
                :key="board.value"
                :value="board.value">
                {{ board.label }}
              </option>
            </select>

            <label for="create-issue-status">Status</label>
            <select
              id="create-issue-status"
              v-model="state.statusId"
              :disabled="!state.boardId"
              required
              @focus="loadStatuses(state.boardId)">
              <option
                disabled
                value="">
                Select status
              </option>
              <option
                v-if="state.loadingStatuses"
                disabled
                value="__loading">
                Loading statuses…
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

            <label for="create-issue-assignee">Assignee</label>
            <div class="issue-assignee">
              <span
                class="avatar"
                :style="{ background: assignee?.color }">
                {{ assignee?.initials ?? '?' }}
              </span>
              <select
                id="create-issue-assignee"
                v-model="state.assigneeId"
                required
                @focus="loadAssignees(state.spaceId)">
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
  CreateIssueAssignee,
  CreateIssueFailure,
  CreateIssuePageDeps,
  LoadSpaceDataFailure,
  LoadStatusesFailure,
  ViewCreateIssueFailure,
} from '~/sections/issues/create-issue/CreateIssuePage.deps'
import { matchResult } from '~/utils/actionResult'
import { assertNever } from '~/utils/assertNever'
import { toAsyncResultState } from '~/utils/asyncResultState'
import { getIssueAttributeValueInput } from '~/utils/issueAttributeValues'

const props = defineProps<{
  deps: CreateIssuePageDeps
  onCreated: (issueKey: string) => Promise<void> | void
}>()
const organizationRoutes = useOrganizationRoutes()
const state = reactive({
  assigneeId: '',
  assignees: [] as CreateIssueAssignee[],
  attributeValues: {} as Record<string, string>,
  boardId: '',
  content: '',
  error: null as null | string,
  files: [] as File[],
  loadingAssignees: false,
  loadingBoards: false,
  loadingStatuses: false,
  spaceId: '',
  statusId: '',
  submitting: false,
})

useHead({ title: 'Add issue' })
const query = await useAsyncData('create-issue', (_nuxtApp, { signal }) =>
  props.deps.view({ signal }),
)
const getViewFailureMessage = (failure: ViewCreateIssueFailure): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'You do not have permission to add issues.'
    case 'temporarilyUnavailable':
      return 'Could not load issue form. The service is temporarily unavailable.'
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
  state.assignees.find((item) => item.value === state.assigneeId),
)

watch(
  () => page.value?.spaceId,
  (value) => (state.spaceId = value ?? ''),
  { immediate: true },
)
watch(
  () => page.value?.boardId,
  (value) => (state.boardId = value ?? ''),
)
watch(
  () => page.value?.statusId,
  (value) => (state.statusId = value ?? ''),
)

const getSpaceFailureMessage = (
  failure: LoadSpaceDataFailure,
  resource: 'assignees' | 'boards',
): string => {
  switch (failure.type) {
    case 'accessDenied':
      return resource === 'assignees'
        ? 'You do not have access to space members.'
        : 'You do not have access to this space.'
    case 'spaceNotFound':
      return 'The selected space was not found.'
    case 'temporarilyUnavailable':
      return `Could not load ${resource}. Try again.`
    default:
      return assertNever(failure)
  }
}

const getStatusesFailureMessage = (failure: LoadStatusesFailure): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'You do not have permission to use this board.'
    case 'boardNotFound':
      return 'The selected board was not found.'
    case 'temporarilyUnavailable':
      return 'Could not load board statuses. Try again.'
    default:
      return assertNever(failure)
  }
}

const getCreateFailureMessage = (failure: CreateIssueFailure): string => {
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

async function loadAssignees(spaceId: string): Promise<void> {
  if (!spaceId || state.loadingAssignees || state.assignees.length) {
    return
  }
  state.error = null
  state.loadingAssignees = true
  try {
    const result = await props.deps.loadAssignees({ spaceId })
    matchResult(result, {
      err: (failure) => {
        state.error = getSpaceFailureMessage(failure, 'assignees')
      },
      ok: (assignees) => {
        state.assignees = assignees
      },
    })
  } finally {
    state.loadingAssignees = false
  }
}

function changeSpace(spaceId: string): void {
  const current = page.value
  state.assignees = []
  state.loadingAssignees = false
  state.loadingBoards = false
  state.loadingStatuses = false
  state.error = null
  if (!current) {
    return
  }
  current.spaceId = spaceId
  current.boardId = ''
  current.statusId = ''
  current.boards = []
  current.statuses = []
}

function changeSelectedSpace(): void {
  state.assigneeId = ''
  changeSpace(state.spaceId)
}

function changeFiles(files: File[]): void {
  state.files = files
}

async function loadBoards(spaceId: string): Promise<void> {
  const current = page.value
  if (!current || current.boards.length || state.loadingBoards) {
    return
  }
  state.error = null
  state.loadingBoards = true
  try {
    const result = await props.deps.loadBoards({ spaceId })
    matchResult(result, {
      err: (failure) => {
        state.error = getSpaceFailureMessage(failure, 'boards')
      },
      ok: ({ boardId, boards }) => {
        current.boardId = boardId
        current.boards = boards
      },
    })
  } finally {
    state.loadingBoards = false
  }
}

function changeBoard(boardId: string): void {
  const current = page.value
  state.loadingStatuses = false
  state.error = null
  if (!current) {
    return
  }
  current.boardId = boardId
  current.statusId = ''
  current.statuses = []
}

async function loadStatuses(boardId: string): Promise<void> {
  const current = page.value
  if (!current || current.statuses.length || state.loadingStatuses) {
    return
  }
  state.error = null
  state.loadingStatuses = true
  try {
    const result = await props.deps.loadStatuses({ boardId })
    matchResult(result, {
      err: (failure) => {
        state.error = getStatusesFailureMessage(failure)
      },
      ok: (statuses) => {
        current.statuses = statuses
      },
    })
  } finally {
    state.loadingStatuses = false
  }
}

async function submitForm(): Promise<void> {
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
      err: (failure) => {
        state.error = getCreateFailureMessage(failure)
      },
      ok: ({ issueKey }) => props.onCreated(issueKey),
    })
  } finally {
    state.submitting = false
  }
}
</script>

<style scoped>
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
