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

import type { IssueDetailsSaveInput } from '~/components/issues/issue-details/IssueDetails.types'
import IssueDetails from '~/components/issues/issue-details/IssueDetails.vue'
import type { IssuePageDeps, ViewIssueFailure } from '~/sections/issues/issue/deps'
import type {
  IssueAssigneeOption,
  IssueMoveOption,
  IssueStatusOption,
} from '~/sections/issues/issue/IssuePage.types'
import type { Result } from '~/utils/actionResult'
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
  (_nuxtApp, { signal }) => props.deps.view({ issueKey: props.issueKey, signal }),
  { watch: [() => props.issueKey] },
)
const getViewFailureMessage = (failure: ViewIssueFailure): string => {
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
    assignees: [] as IssueAssigneeOption[],
    boards: [] as IssueMoveOption[],
    error: null as null | string,
    loadingAssignees: false,
    loadingMoveBoards: false,
    loadingMoveSpaces: false,
    loadingStatuses: false,
    spaces: [] as IssueMoveOption[],
    statuses: [] as IssueStatusOption[],
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

async function loadAssignees(spaceId: string) {
  await loadLookup({
    apply: (assignees) => {
      state.lookup.assignees = assignees
    },
    errorMessage: 'Could not load assignees.',
    loading: 'loadingAssignees',
    request: () => props.deps.loadAssignees({ spaceId }),
  })
}

async function loadMoveSpaces() {
  await loadLookup({
    apply: (spaces) => {
      state.lookup.spaces = spaces
    },
    errorMessage: 'Could not load available spaces.',
    loading: 'loadingMoveSpaces',
    request: props.deps.loadMoveSpaces,
  })
}

async function loadMoveBoards(spaceId: string) {
  await loadLookup({
    apply: (boards) => {
      state.lookup.boards = boards
    },
    errorMessage: 'Could not load boards.',
    loading: 'loadingMoveBoards',
    request: () => props.deps.loadMoveBoards({ spaceId }),
  })
}

async function loadStatuses(boardId: string) {
  await loadLookup({
    apply: (statuses) => {
      state.lookup.statuses = statuses
    },
    errorMessage: 'Could not load board statuses.',
    loading: 'loadingStatuses',
    request: () => props.deps.loadStatuses({ boardId }),
  })
}

type LookupLoading =
  | 'loadingAssignees'
  | 'loadingMoveBoards'
  | 'loadingMoveSpaces'
  | 'loadingStatuses'

async function loadLookup<Value>(options: {
  apply: (value: Value) => void
  errorMessage: string
  loading: LookupLoading
  request: () => Promise<Result<Value>>
}) {
  state.lookup.error = null
  state.lookup[options.loading] = true
  try {
    const result = await options.request()
    if (!result.ok) {
      state.lookup.error = options.errorMessage
      return
    }
    options.apply(result.value)
  } finally {
    state.lookup[options.loading] = false
  }
}

async function save(input: IssueDetailsSaveInput) {
  const current = pageState.value
  if (current.type !== 'ready') {
    return
  }
  state.saving = true
  state.error = null
  try {
    const updateResult = await props.deps.updateIssue({
      assigneeId: input.assigneeId,
      attributeValues: getIssueAttributeValueInput(input.attributeValues, current.data.attributes),
      content: input.content,
      files: input.files,
      issueKey: props.issueKey,
      removeAttachmentIds: input.removeAttachmentIds,
    })
    if (!updateResult.ok) {
      state.error =
        updateResult.error.type === 'invalidInput'
          ? updateResult.error.message
          : 'Could not save issue. Try again.'
      return
    }

    if (input.statusId !== current.data.statusId) {
      const moveResult = await props.deps.moveIssue({
        issueKey: props.issueKey,
        statusId: input.statusId,
      })
      if (!moveResult.ok) {
        state.error = 'Could not move issue. Try again.'
        await query.refresh()
        return
      }
    }

    await leaveAfterIssueChanged()
  } finally {
    state.saving = false
  }
}

async function remove() {
  if (!confirm('Delete this issue?')) {
    return
  }
  const result = await props.deps.deleteIssue({ issueKey: props.issueKey })
  if (!result.ok) {
    state.error = 'Could not delete issue. Try again.'
    return
  }
  await leaveAfterIssueChanged()
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
