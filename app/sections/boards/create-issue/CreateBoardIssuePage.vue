<template>
  <CreateBoardIssueContent
    v-if="pageState.type === 'ready'"
    :assignees="assignees"
    :error="formError"
    :loading-assignees="loadingAssignees"
    :on-load-assignees="loadAssignees"
    :on-submit="submit"
    :space-key="spaceKey"
    :submitting="submitting"
    :view-model="pageState.data.CreateBoardIssuePage" />
  <PageLoadState
    v-else
    :error-text="pageState.type === 'error' ? pageState.message : ''"
    :loading="pageState.type === 'pending'"
    loading-text="Loading issue form…"
    :on-retry="refresh" />
</template>

<script setup lang="ts">
import CreateBoardIssueContent from '~/sections/boards/create-issue/components/CreateBoardIssueContent.vue'
import type { CreateBoardIssuePageDeps } from '~/sections/boards/create-issue/CreateBoardIssuePageDeps'
import { getIssueAttributeValueInput } from '~/utils/issueAttributeValues'

const props = defineProps<{
  boardId: string
  deps: CreateBoardIssuePageDeps
  spaceKey: string
}>()
const organizationRoutes = useOrganizationRoutes()
useHead({ title: 'Add issue' })
const { refresh, state: pageState } = await useActionData({
  action: () => props.deps.viewCreateBoardIssuePage({ boardId: props.boardId }),
  fallbackMessage: 'Could not load issue form. Try again.',
  messages: {
    AccessDenied: 'You do not have permission to add issues to this board.',
    BoardNotFound: 'The board was not found or is not available to you.',
    TemporarilyUnavailable:
      'Could not load issue form. The service is temporarily unavailable.',
  },
  watch: [() => props.boardId],
})
const formError = ref<null | string>(null)
const assignees = ref<
  Array<{ color: string; initials: string; label: string; value: string }>
>([])
const loadingAssignees = ref(false)
const submitting = ref(false)

async function loadAssignees() {
  if (loadingAssignees.value || assignees.value.length) {
    return
  }
  formError.value = null
  loadingAssignees.value = true
  const result = await props.deps.loadCreateBoardIssueAssignees({
    spaceKey: props.spaceKey,
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
  statusId: string
}) {
  if (pageState.value.type !== 'ready') {
    return
  }
  formError.value = null
  submitting.value = true
  const result = await props.deps.createBoardIssue({
    ...input,
    attributeValues: getIssueAttributeValueInput(
      input.attributeValues,
      pageState.value.data.CreateBoardIssuePage.attributes,
    ),
  })
  submitting.value = false
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
    ok: async () => {
      await navigateTo(
        organizationRoutes.board(props.spaceKey, props.boardId),
        {
          replace: true,
        },
      )
    },
    result,
  })
}
</script>
