<template>
  <CreateBacklogIssueContent
    v-if="pageState.type === 'ready'"
    :assignees="assignees"
    :error="formError"
    :loading-assignees="loadingAssignees"
    :on-load-assignees="loadAssignees"
    :on-submit="submit"
    :submitting="submitting"
    :view-model="pageState.data.CreateBacklogIssuePage" />
  <PageLoadState
    v-else
    :error-text="pageState.type === 'error' ? pageState.message : ''"
    :loading="pageState.type === 'pending'"
    loading-text="Loading backlog issue form…"
    :on-retry="refresh" />
</template>

<script setup lang="ts">
import CreateBacklogIssueContent from '~/sections/spaces/create-backlog-issue/components/CreateBacklogIssueContent.vue'
import type { CreateBacklogIssuePageDeps } from '~/sections/spaces/create-backlog-issue/CreateBacklogIssuePageDeps'
import { getIssueAttributeValueInput } from '~/utils/issueAttributeValues'

const props = defineProps<{
  deps: CreateBacklogIssuePageDeps
  spaceKey: string
}>()
const organizationRoutes = useOrganizationRoutes()
useHead({ title: 'Add backlog issue' })
const { refresh, state: pageState } = await useActionData({
  action: () =>
    props.deps.viewCreateBacklogIssuePage({ spaceKey: props.spaceKey }),
  fallbackMessage: 'Could not load backlog issue form. Try again.',
  messages: {
    AccessDenied: 'You do not have permission to add backlog issues.',
    BacklogNotFound: 'The backlog was not found or is not available to you.',
    SpaceNotFound: 'The space was not found or is not available to you.',
    TemporarilyUnavailable:
      'Could not load backlog issue form. The service is temporarily unavailable.',
  },
  watch: [() => props.spaceKey],
})
const formError = ref<null | string>(null)
const assignees = ref<
  Array<{ color: string; initials: string; label: string; value: string }>
>([])
const loadingAssignees = ref(false)
const submitting = ref(false)

async function loadAssignees() {
  if (
    pageState.value.type !== 'ready' ||
    loadingAssignees.value ||
    assignees.value.length
  ) {
    return
  }
  formError.value = null
  loadingAssignees.value = true
  const result = await props.deps.loadCreateBacklogIssueAssignees({
    spaceId: pageState.value.data.CreateBacklogIssuePage.spaceId,
  })
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

async function submit(input: {
  assigneeId: string
  attributeValues: Record<string, string>
  content: string
  files: File[]
  statusId: string
}) {
  if (pageState.value.type !== 'ready') {
    return
  }
  formError.value = null
  submitting.value = true
  const result = await props.deps.createBacklogIssue({
    assigneeId: input.assigneeId,
    attributeValues: getIssueAttributeValueInput(
      input.attributeValues,
      pageState.value.data.CreateBacklogIssuePage.attributes,
    ),
    content: input.content,
    statusId: input.statusId,
  })
  await matchActionResult({
    err: async (actionError) => {
      formError.value = getErrorMessage({
        error: actionError,
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
      await navigateTo(organizationRoutes.backlog(props.spaceKey), {
        replace: true,
      })
    },
    result,
  })
  submitting.value = false
}
</script>
