<template>
  <MemberPermissionsPage
    v-if="pageState.type === 'ready'"
    :error="error"
    :saved="saved"
    :submitting="submitting"
    :view-model="pageState.data.MemberPermissionsPage"
    @submit="submit" />
  <PageLoadState
    v-else
    :error-text="pageState.type === 'error' ? pageState.message : ''"
    :loading="pageState.type === 'pending'"
    loading-text="Loading member permissions…"
    @retry="refresh()" />
</template>

<script setup lang="ts">
import type { MemberPermissionsPageApplicationDeps } from './MemberPermissionsPageApplicationDeps'
import type { MemberPermissions } from './view/MemberPermissionsPage.vue'
import MemberPermissionsPage from './view/MemberPermissionsPage.vue'

const props = defineProps<{
  deps: MemberPermissionsPageApplicationDeps
  memberId: string
}>()
const { refresh, state: pageState } = await useActionData({
  action: () =>
    props.deps.viewMemberPermissionsPage({ memberId: props.memberId }),
  fallbackMessage:
    'Could not load member permissions. The service is temporarily unavailable.',
  key: () => asyncDataKeys.workspace.memberPermissions(props.memberId),
  messages: {
    AccessDenied: 'You do not have permission to open this page.',
    PermissionsNotFound: 'The requested page was not found.',
    TemporarilyUnavailable:
      'Could not load member permissions. The service is temporarily unavailable.',
  },
  watch: [() => props.memberId],
})
useHead({
  title: computed(() =>
    pageState.value.type === 'ready'
      ? `${pageState.value.data.MemberPermissionsPage.member.name} permissions`
      : 'Member permissions',
  ),
})
const submitting = ref(false)
const saved = ref(false)
const error = ref<null | string>(null)
const invalidation = useAsyncDataInvalidation()

async function submit(permissions: MemberPermissions) {
  submitting.value = true
  saved.value = false
  error.value = null
  const result = await props.deps.updateMemberPermissions({
    memberId: props.memberId,
    permissions,
  })
  await matchActionResult({
    err: async (actionError) => {
      error.value = getErrorMessage({
        error: actionError,
        messages: {
          AccessDenied: 'You do not have permission to update this member.',
          MemberNotFound: 'The requested page was not found.',
          TemporarilyUnavailable: 'Could not save permissions.',
        },
      })
    },
    ok: async () => {
      await Promise.all([
        refresh(),
        invalidation.invalidateWorkspaceStructure(),
      ])
      saved.value = true
    },
    result,
  })
  submitting.value = false
}
</script>
