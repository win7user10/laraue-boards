<template>
  <CreateIssueContent
    v-if="pageState.type === 'ready'"
    :assignees="assignees"
    :error="formError"
    :loading-assignees="loadingAssignees"
    :loading-boards="loadingBoards"
    :loading-statuses="loadingStatuses"
    :on-change-board="changeBoard"
    :on-change-space="changeSpace"
    :on-load-assignees="loadAssignees"
    :on-load-boards="loadBoards"
    :on-load-statuses="loadStatuses"
    :on-submit="submit"
    :submitting="submitting"
    :view-model="pageState.data.CreateIssuePage" />
  <PageLoadState
    v-else
    :error-text="pageState.type === 'error' ? pageState.message : ''"
    :loading="pageState.type === 'pending'"
    loading-text="Loading issue form…"
    :on-retry="refresh" />
</template>

<script setup lang="ts">
import CreateIssueContent from '~/sections/issues/create-issue/components/CreateIssueContent.vue'
import type { CreateIssuePageDeps } from '~/sections/issues/create-issue/CreateIssuePageDeps'
import { getIssueAttributeValueInput } from '~/utils/issueAttributeValues'

const props = defineProps<{ deps: CreateIssuePageDeps }>()
const organizationRoutes = useOrganizationRoutes()
useHead({ title: 'Add issue' })
const { refresh, state: pageState } = await useActionData({
  action: () => props.deps.viewCreateIssuePage(),
  fallbackMessage: 'Could not load issue form. Try again.',
  messages: {
    AccessDenied: 'You do not have permission to add issues.',
    TemporarilyUnavailable:
      'Could not load issue form. The service is temporarily unavailable.',
  },
})
const page = computed(() =>
  pageState.value.type === 'ready'
    ? pageState.value.data.CreateIssuePage
    : null,
)
const formError = ref<null | string>(null)
const assignees = ref<
  Array<{ color: string; initials: string; label: string; value: string }>
>([])
const loadingAssignees = ref(false)
const loadingBoards = ref(false)
const loadingStatuses = ref(false)
const submitting = ref(false)

async function loadAssignees(spaceId: string) {
  if (!spaceId || loadingAssignees.value || assignees.value.length) {
    return
  }
  formError.value = null
  loadingAssignees.value = true
  const result = await props.deps.loadCreateIssueAssignees({ spaceId })
  loadingAssignees.value = false
  matchActionResult({
    err: (error) => {
      formError.value = getErrorMessage({
        error,
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

function changeSpace(spaceId: string) {
  assignees.value = []
  loadingAssignees.value = false
  loadingBoards.value = false
  loadingStatuses.value = false
  const current = page.value
  if (!current) {
    return
  }
  current.spaceId = spaceId
  current.boardId = ''
  current.statusId = ''
  current.boards = []
  current.statuses = []
  formError.value = null
}

async function loadBoards(spaceId: string) {
  const current = page.value
  if (!current || current.boards.length > 0) {
    return
  }
  formError.value = null
  loadingBoards.value = true
  const result = await props.deps.loadCreateIssueBoards({ spaceId })
  loadingBoards.value = false
  matchActionResult({
    err: (error) => {
      formError.value = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have access to this space.',
          SpaceNotFound: 'The selected space was not found.',
          TemporarilyUnavailable: 'Could not load boards. Try again.',
        },
      })
    },
    ok: (value) => {
      current.boards = value.boards
      current.boardId = value.boardId
    },
    result,
  })
}

function changeBoard(boardId: string) {
  loadingStatuses.value = false
  const current = page.value
  if (!current) {
    return
  }
  current.boardId = boardId
  current.statusId = ''
  current.statuses = []
  formError.value = null
}

async function loadStatuses(boardId: string) {
  const current = page.value
  if (!current || current.statuses.length > 0) {
    return
  }
  formError.value = null
  loadingStatuses.value = true
  const result = await props.deps.loadCreateIssueStatuses({ boardId })
  loadingStatuses.value = false
  matchActionResult({
    err: (error) => {
      formError.value = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have permission to use this board.',
          BoardNotFound: 'The selected board was not found.',
          TemporarilyUnavailable: 'Could not load board statuses. Try again.',
        },
      })
    },
    ok: (value) => {
      current.statuses = value.statuses
      current.statusId = current.statuses[0]?.value ?? ''
    },
    result,
  })
}

async function submit(input: {
  assigneeId: string
  attributeValues: Record<string, string>
  content: string
  files: File[]
  statusId: string
}) {
  const current = page.value
  if (!current) {
    return
  }
  formError.value = null
  submitting.value = true
  const result = await props.deps.createIssue({
    assigneeId: input.assigneeId,
    attributeValues: getIssueAttributeValueInput(
      input.attributeValues,
      current.attributes,
    ),
    content: input.content,
    statusId: input.statusId,
  })
  await matchActionResult({
    err: async (error) => {
      formError.value = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have permission to add this issue.',
          StatusNotFound: 'The selected status was not found.',
          TemporarilyUnavailable: 'Could not add issue. Try again.',
        },
      })
    },
    ok: async ({ issueKey }) => {
      if (input.files.length) {
        const attachmentResult = await props.deps.addIssueAttachments({
          files: input.files,
          issueKey,
        })
        matchActionResult({
          err: (error) => {
            window.alert(
              getErrorMessage({
                error,
                messages: {
                  AttachmentUploadFailed:
                    'The issue was created, but one or more attachments could not be uploaded. Open the issue to try again.',
                },
              }),
            )
          },
          ok: () => undefined,
          result: attachmentResult,
        })
      }
      await navigateTo(organizationRoutes.issues(), {
        replace: true,
      })
    },
    result,
  })
  submitting.value = false
}
</script>
