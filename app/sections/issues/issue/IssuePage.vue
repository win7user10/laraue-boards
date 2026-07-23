<template>
  <PageState
    v-if="!state.leaving"
    error-title="Could not load issue"
    loading-text="Loading issue…"
    :on-retry="query.refresh"
    :state="pageState">
    <template #default="{ data }">
      <section>
        <div class="title-row">
          <div class="page-heading">
            <button
              aria-label="Back"
              class="icon-btn"
              type="button"
              @click="leave">
              <ArrowLeft />
            </button>
            <div class="page-heading-text">
              <h1>{{ data.issueKey }}</h1>
            </div>
          </div>
        </div>
        <IssueDetails
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
          :on-save="save"
          :saving="state.saving"
          :view-model="data" />
        <div
          v-if="data.canEdit"
          class="page-actions">
          <button
            class="primary"
            :disabled="!state.canSave"
            :form="formId"
            type="submit">
            {{ state.saving ? 'Saving…' : 'Save changes' }}
          </button>
          <button
            class="secondary danger"
            :disabled="state.saving"
            type="button"
            @click="remove">
            <Trash2 />
            Delete issue
          </button>
        </div>
      </section>
    </template>
  </PageState>
</template>

<script setup lang="ts">
import { ArrowLeft, Trash2 } from 'lucide-vue-next'

import IssueDetails from '~/components/issues/issue-details/IssueDetails.vue'
import type { IssueDetailsSaveInput } from '~/components/issues/issue-details/IssueDetails.vue'
import type {
  IssuePageDeps,
  IssueResourceFailure,
  LoadBoardFailure,
  LoadSpaceFailure,
  MoveIssueFailure,
  UpdateIssueFailure,
} from '~/sections/issues/issue/IssuePage.deps'
import { matchResult } from '~/utils/actionResult'
import { assertNever } from '~/utils/assertNever'
import { toAsyncResultState } from '~/utils/asyncResultState'
import { getIssueAttributeValueInput } from '~/utils/issueAttributeValues'

const props = defineProps<{
  deps: IssuePageDeps
  issueKey: string
  onBack: () => Promise<void> | void
}>()
const formId = useId()
const query = await useAsyncData(
  () => `issue:${props.issueKey}`,
  (_nuxtApp, { signal }) =>
    props.deps.view({ issueKey: props.issueKey, signal }),
  { watch: [() => props.issueKey] },
)
const getViewFailureMessage = (failure: IssueResourceFailure): string => {
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
const pageState = computed(() =>
  toAsyncResultState({
    error: query.error.value,
    getErrorMessage: getViewFailureMessage,
    result: query.data.value,
    status: query.status.value,
  }),
)
const state = reactive({
  canSave: false,
  dirty: false,
  error: null as null | string,
  leaving: false,
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

useUnsavedChangesWarning(toRef(state, 'dirty'))
useHead({
  title: computed(() =>
    pageState.value.type === 'ready' ? pageState.value.data.issueKey : 'Issue',
  ),
})
watch(
  () => props.issueKey,
  () => {
    state.error = null
    resetLookups()
  },
)

function setDirty(value: boolean) {
  state.dirty = value
}

function setCanSave(value: boolean) {
  state.canSave = value
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

const getSpaceFailureMessage = (failure: LoadSpaceFailure): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'You do not have access to this space.'
    case 'spaceNotFound':
      return 'The selected space was not found.'
    case 'temporarilyUnavailable':
      return 'Could not load space data. Try again.'
    default:
      return assertNever(failure)
  }
}

async function loadAssignees(spaceId: string) {
  state.lookup.error = null
  state.lookup.loadingAssignees = true
  const result = await props.deps.loadAssignees({ spaceId })
  state.lookup.loadingAssignees = false
  matchResult(result, {
    err: (failure) => {
      state.lookup.error = getSpaceFailureMessage(failure)
    },
    ok: ({ assignees }) => {
      state.lookup.assignees = assignees
    },
  })
}

async function loadMoveSpaces() {
  state.lookup.error = null
  state.lookup.loadingMoveSpaces = true
  const result = await props.deps.loadMoveSpaces()
  state.lookup.loadingMoveSpaces = false
  matchResult(result, {
    err: (failure) => {
      state.lookup.error =
        failure.type === 'accessDenied'
          ? 'You do not have access to available spaces.'
          : 'Could not load available spaces.'
    },
    ok: ({ spaces }) => {
      state.lookup.spaces = spaces
    },
  })
}

async function loadMoveBoards(spaceId: string) {
  state.lookup.error = null
  state.lookup.loadingMoveBoards = true
  const result = await props.deps.loadMoveBoards({ spaceId })
  state.lookup.loadingMoveBoards = false
  matchResult(result, {
    err: (failure) => {
      state.lookup.error = getSpaceFailureMessage(failure)
    },
    ok: ({ boards }) => {
      state.lookup.boards = boards
    },
  })
}

const getBoardFailureMessage = (failure: LoadBoardFailure): string => {
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

async function loadStatuses(boardId: string) {
  state.lookup.error = null
  state.lookup.loadingStatuses = true
  const result = await props.deps.loadStatuses({ boardId })
  state.lookup.loadingStatuses = false
  matchResult(result, {
    err: (failure) => {
      state.lookup.error = getBoardFailureMessage(failure)
    },
    ok: ({ statuses }) => {
      state.lookup.statuses = statuses
    },
  })
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

async function save(input: IssueDetailsSaveInput) {
  const current = pageState.value
  if (current.type !== 'ready') {
    return
  }
  state.saving = true
  state.error = null
  const updateResult = await props.deps.updateIssue({
    assigneeId: input.assigneeId,
    attributeValues: getIssueAttributeValueInput(
      input.attributeValues,
      current.data.attributes,
    ),
    content: input.content,
    files: input.files,
    issueKey: props.issueKey,
    removeAttachmentIds: input.removeAttachmentIds,
  })
  await matchResult(updateResult, {
    err: (failure) => {
      state.error = getUpdateFailureMessage(failure)
    },
    ok: async () => {
      if (input.statusId !== current.data.statusId) {
        const moveResult = await props.deps.moveIssue({
          issueKey: props.issueKey,
          statusId: input.statusId,
        })
        const moved = matchResult(moveResult, {
          err: (failure) => {
            state.error = getMoveFailureMessage(failure)
            return false
          },
          ok: () => true,
        })
        if (!moved) {
          await query.refresh()
          return
        }
      }
      await leaveAfterIssueChanged()
    },
  })
  state.saving = false
}

async function remove() {
  if (!confirm('Delete this issue?')) {
    return
  }
  const result = await props.deps.deleteIssue({ issueKey: props.issueKey })
  await matchResult(result, {
    err: (failure) => {
      state.error =
        failure.type === 'accessDenied'
          ? 'You do not have permission to delete this issue.'
          : failure.type === 'issueNotFound'
            ? 'This issue no longer exists.'
            : 'Could not delete issue. Try again.'
    },
    ok: leaveAfterIssueChanged,
  })
}

async function leave() {
  state.leaving = true
  await props.onBack()
}

async function leaveAfterIssueChanged() {
  state.dirty = false
  await leave()
}
</script>
