<template>
  <IssueContent
    v-if="pageState.type === 'ready'"
    :error="error"
    :issue-details-deps="deps.issueDetails"
    :on-back="returnToSource"
    :on-delete="remove"
    :on-dirty-change="setDirty"
    :on-save="save"
    :saving="saving"
    :view-model="pageState.data.IssuePage" />
  <PageLoadState
    v-else-if="!leaving"
    :error-text="pageState.type === 'error' ? pageState.message : ''"
    :loading="pageState.type === 'pending'"
    loading-text="Loading issue…"
    :on-retry="refresh" />
</template>

<script setup lang="ts">
import IssueContent from '~/sections/issues/issue/components/IssueContent.vue'
import type { IssuePageDeps } from '~/sections/issues/issue/IssuePageDeps'
import { getIssueAttributeValueInput } from '~/utils/issueAttributeValues'

const props = defineProps<{
  deps: IssuePageDeps
  issueKey: string
}>()
const organizationRoutes = useOrganizationRoutes()
const { refresh, state: pageState } = await useActionData({
  action: () => props.deps.viewIssuePage({ issueKey: props.issueKey }),
  fallbackMessage: 'Could not load issue. Try again.',
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
const dirty = ref(false)
const error = ref<null | string>(null)
const leaving = ref(false)

useUnsavedChangesWarning(dirty)

watch(
  () => props.issueKey,
  () => {
    error.value = null
  },
)

async function returnToSource() {
  leaving.value = true
  const back = window.history.state?.back
  if (typeof back === 'string' && back.startsWith('/')) {
    await navigateTo(back, { replace: true })
    return
  }
  await navigateTo(organizationRoutes.issues(), { replace: true })
}

function setDirty(value: boolean) {
  dirty.value = value
}

async function save(input: {
  assigneeId: string
  attributeValues: Record<string, string>
  content: string
  files: File[]
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
    files: input.files,
    issueKey: props.issueKey,
    removeAttachmentIds: input.removeAttachmentIds,
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
          await refresh()
          return
        }
      }
      await leaveAfterIssueChanged()
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
  await matchActionResult({
    err: async (actionError) => {
      error.value = getErrorMessage({
        error: actionError,
        messages: {
          AccessDenied: 'You do not have permission to delete this issue.',
          IssueNotFound: 'This issue no longer exists.',
          TemporarilyUnavailable: 'Could not delete issue. Try again.',
        },
      })
    },
    ok: leaveAfterIssueChanged,
    result,
  })
}

async function leaveAfterIssueChanged() {
  dirty.value = false
  await returnToSource()
}
</script>
