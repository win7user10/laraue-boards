<template>
  <IssuePage
    v-if="pageState.type === 'ready'"
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
    :view-model="pageState.data.IssuePage"
    @back="returnToSource"
    @change-board="changeBoard"
    @change-move-space="changeMoveSpace"
    @delete="remove"
    @load-assignees="loadAssignees"
    @load-move-boards="loadMoveBoards"
    @load-move-spaces="loadMoveSpaces"
    @load-statuses="loadStatuses"
    @save="save" />
  <PageLoadState
    v-else
    :error-text="pageState.type === 'error' ? pageState.message : ''"
    :loading="pageState.type === 'pending'"
    loading-text="Loading issue…"
    @retry="refresh()" />
</template>

<script setup lang="ts">
import { getIssueAttributeValueInput } from '../../../utils/issueAttributeValues'
import type { IssuePageApplicationDeps } from './IssuePageApplicationDeps'
import IssuePage from './view/IssuePage.vue'

const props = defineProps<{
  deps: IssuePageApplicationDeps
  issueKey: string
}>()
const organizationRoutes = useOrganizationRoutes()
const router = useRouter()
const { refresh, state: pageState } = await useActionData({
  action: () => props.deps.viewIssuePage({ issueKey: props.issueKey }),
  fallbackMessage: 'Could not load issue. Try again.',
  key: () => asyncDataKeys.issue.view(props.issueKey),
  messages: {
    AccessDenied: 'You do not have access to this issue.',
    IssueNotFound: 'The issue was not found or is not available to you.',
    TemporarilyUnavailable:
      'Could not load issue. The service is temporarily unavailable.',
  },
  watch: [() => props.issueKey],
})
useHead({
  title: computed(() =>
    pageState.value.type === 'ready'
      ? pageState.value.data.IssuePage.issueKey
      : 'Issue',
  ),
})
const saving = ref(false)
const assignees = ref<
  Array<{ color: string; initials: string; label: string; value: string }>
>([])
const loadingAssignees = ref(false)
const loadingStatuses = ref(false)
const statuses = ref<Array<{ id: string; name: string }>>([])
const error = ref<null | string>(null)
const loadingMoveSpaces = ref(false)
const loadingMoveBoards = ref(false)
const moveSpaces = ref<Array<{ label: string; value: string }>>([])
const moveBoards = ref<Array<{ label: string; value: string }>>([])
const invalidation = useAsyncDataInvalidation()
const runLoadAssignees = createLatestRequest()

watch(
  () => props.issueKey,
  () => {
    runLoadAssignees.cancel()
    assignees.value = []
    moveSpaces.value = []
    moveBoards.value = []
    statuses.value = []
    loadingMoveSpaces.value = false
    loadingAssignees.value = false
    loadingMoveBoards.value = false
    loadingStatuses.value = false
    error.value = null
  },
)

async function loadAssignees(spaceId: string) {
  if (!spaceId || loadingAssignees.value || assignees.value.length) {
    return
  }
  error.value = null
  loadingAssignees.value = true
  const result = await runLoadAssignees({
    request: () => props.deps.loadIssueAssignees({ spaceId }),
  })
  if (!result) {
    return
  }
  loadingAssignees.value = false
  matchActionResult({
    err: (actionError) => {
      error.value = getErrorMessage({
        error: actionError,
        messages: {
          AccessDenied: 'You do not have access to space members.',
          SpaceNotFound: 'The selected space was not found.',
          TemporarilyUnavailable: 'Could not load assignees. Try again.',
        },
      })
    },
    ok: (value) => {
      assignees.value = value.assignees
    },
    result,
  })
}

function returnToSource() {
  const back = window.history.state?.back
  if (typeof back === 'string' && back.startsWith('/')) {
    router.back()
    return
  }
  void navigateTo(organizationRoutes.issues(), { replace: true })
}

async function loadMoveSpaces() {
  error.value = null
  moveSpaces.value = []
  loadingMoveSpaces.value = true
  const result = await props.deps.loadIssueMoveSpaces()
  loadingMoveSpaces.value = false
  matchActionResult({
    err: (actionError) => {
      error.value = getErrorMessage({
        error: actionError,
        messages: {
          AccessDenied: 'You do not have access to available spaces.',
          TemporarilyUnavailable: 'Could not load available spaces.',
        },
      })
    },
    ok: (value) => {
      moveSpaces.value = value.spaces
    },
    result,
  })
}

function changeMoveSpace() {
  runLoadAssignees.cancel()
  assignees.value = []
  loadingAssignees.value = false
  loadingMoveBoards.value = false
  loadingStatuses.value = false
  error.value = null
  moveBoards.value = []
  statuses.value = []
}

async function loadMoveBoards(spaceId: string) {
  error.value = null
  loadingMoveBoards.value = true
  const result = await props.deps.loadIssueMoveBoards({ spaceId })
  loadingMoveBoards.value = false
  matchActionResult({
    err: (actionError) => {
      error.value = getErrorMessage({
        error: actionError,
        messages: {
          AccessDenied: 'You do not have access to this space.',
          SpaceNotFound: 'This space no longer exists.',
          TemporarilyUnavailable: 'Could not load space boards.',
        },
      })
    },
    ok: (value) => {
      moveBoards.value = value.boards
    },
    result,
  })
}

function changeBoard() {
  loadingStatuses.value = false
  statuses.value = []
  error.value = null
}

async function loadStatuses(boardId: string) {
  loadingStatuses.value = true
  error.value = null
  const result = await props.deps.loadIssueStatuses({ boardId })
  matchActionResult({
    err: (actionError) => {
      statuses.value = []
      error.value = getErrorMessage({
        error: actionError,
        messages: {
          AccessDenied: 'You do not have access to this board.',
          BoardNotFound: 'This board no longer exists.',
          TemporarilyUnavailable: 'Could not load board statuses.',
        },
      })
    },
    ok: (value) => {
      statuses.value = value.statuses
    },
    result,
  })
  loadingStatuses.value = false
}
async function save(input: {
  assigneeId: string
  attributeValues: Record<string, string>
  content: string
  statusId: string
}) {
  if (pageState.value.type !== 'ready') {
    return
  }
  const issue = pageState.value.data.IssuePage
  saving.value = true
  error.value = null
  const updateResult = await props.deps.updateIssue({
    assigneeId: input.assigneeId,
    attributeValues: getIssueAttributeValueInput(
      input.attributeValues,
      issue.attributes,
    ),
    content: input.content,
    issueKey: props.issueKey,
  })
  await matchActionResult({
    err: async (actionError) => {
      error.value = getErrorMessage({
        error: actionError,
        messages: {
          AccessDenied: 'You do not have permission to update this issue.',
          IssueNotFound: 'The issue was not found.',
          TemporarilyUnavailable: 'Could not save issue. Try again.',
        },
      })
    },
    ok: async () => {
      if (
        pageState.value.type === 'ready' &&
        input.statusId !== pageState.value.data.IssuePage.statusId
      ) {
        const moveResult = await props.deps.moveIssue({
          issueKey: props.issueKey,
          statusId: input.statusId,
        })
        const moved = matchActionResult({
          err: (moveError) => {
            error.value = getErrorMessage({
              error: moveError,
              messages: {
                AccessDenied:
                  'You do not have permission to update this issue.',
                InvalidStatus: 'Select a valid board status.',
                ResourceNotFound: 'The issue or board status was not found.',
                TemporarilyUnavailable: 'Could not save issue. Try again.',
              },
            })
            return false
          },
          ok: () => true,
          result: moveResult,
        })
        if (!moved) {
          invalidation.invalidateIssueDataExceptIssuePage(props.issueKey)
          await refresh()
          return
        }
      }
      invalidation.invalidateIssueData(props.issueKey)
      returnToSource()
    },
    result: updateResult,
  })
  saving.value = false
}
async function remove() {
  if (!confirm('Delete this issue?')) {
    return
  }
  const result = await props.deps.deleteIssue({ issueKey: props.issueKey })
  matchActionResult({
    err: (actionError) => {
      error.value = getErrorMessage({
        error: actionError,
        messages: {
          AccessDenied: 'You do not have permission to delete this issue.',
          IssueNotFound: 'This issue no longer exists.',
          TemporarilyUnavailable: 'Could not delete issue. Try again.',
        },
      })
    },
    ok: () => {
      invalidation.invalidateIssueData(props.issueKey)
      returnToSource()
    },
    result,
  })
}
</script>
