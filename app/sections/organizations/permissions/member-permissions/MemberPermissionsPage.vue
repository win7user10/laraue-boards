<template>
  <MemberPermissionsForm
    v-if="pageState.type === 'ready'"
    :deps="deps.form"
    :member-id="memberId"
    :on-saved="handleSaved"
    :view-model="pageState.data.MemberPermissionsPage" />
  <PageLoadState
    v-else
    :error-text="pageState.type === 'error' ? pageState.message : ''"
    :loading="pageState.type === 'pending'"
    loading-text="Loading member permissions…"
    :on-retry="refresh" />
</template>

<script setup lang="ts">
import MemberPermissionsForm from '~/sections/organizations/permissions/member-permissions/components/MemberPermissionsForm/MemberPermissionsForm.vue'
import type { MemberPermissionsPageDeps } from '~/sections/organizations/permissions/member-permissions/MemberPermissionsPageDeps'

const props = defineProps<{
  deps: MemberPermissionsPageDeps
  memberId: string
}>()
const organizationRoutes = useOrganizationRoutes()
const { refresh, state: pageState } = await useActionData({
  action: () =>
    props.deps.viewMemberPermissionsPage({ memberId: props.memberId }),
  fallbackMessage:
    'Could not load member permissions. The service is temporarily unavailable.',
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
async function handleSaved() {
  await navigateTo(organizationRoutes.permissions())
  await refreshAppLayoutData()
}
</script>
