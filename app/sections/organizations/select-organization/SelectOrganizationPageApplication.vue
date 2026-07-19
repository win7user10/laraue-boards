<template>
  <OrganizationPickerPage
    v-if="pageState.type === 'ready'"
    :error="error"
    :selecting="selecting"
    :view-model="pageState.data.OrganizationPickerPage"
    @select="select" />
  <PageLoadState
    v-else
    :error-text="pageState.type === 'error' ? pageState.message : ''"
    :loading="pageState.type === 'pending'"
    loading-text="Loading organizations…"
    :retry-text="
      pageState.type === 'error' && pageState.error === 'AccessDenied'
        ? 'Sign in'
        : 'Try again'
    "
    @retry="retry" />
</template>

<script setup lang="ts">
import type { SelectOrganizationPageApplicationDeps } from './SelectOrganizationPageApplicationDeps'
import OrganizationPickerPage from './view/OrganizationPickerPage.vue'

const props = defineProps<{ deps: SelectOrganizationPageApplicationDeps }>()
useHead({ title: 'Organizations' })
const { refresh, state: pageState } = await useActionData({
  action: () => props.deps.viewOrganizationPickerPage(),
  fallbackMessage: 'Could not load organizations. Try again.',
  key: asyncDataKeys.organizations.list,
  messages: {
    AccessDenied: 'Your session is missing or has expired.',
    TemporarilyUnavailable:
      'Could not load organizations. The service is temporarily unavailable.',
  },
})
const retry = () =>
  pageState.value.type === 'error' && pageState.value.error === 'AccessDenied'
    ? navigateTo('/')
    : refresh()
const selecting = ref(false)
const error = ref<null | string>(null)
const invalidation = useAsyncDataInvalidation()
const select = async (input: {
  organizationId: string
  organizationKey: string
}) => {
  selecting.value = true
  error.value = null
  const result = await props.deps.selectOrganization({
    organizationId: input.organizationId,
  })
  selecting.value = false
  await matchActionResult({
    err: async (actionError) => {
      error.value = getErrorMessage({
        error: actionError,
        messages: {
          AccessDenied: 'Your session has expired. Sign in again.',
          OrganizationNotFound:
            'This organization is no longer available to you.',
          TemporarilyUnavailable: 'Could not open organization. Try again.',
        },
      })
    },
    ok: async () => {
      invalidation.resetSelectedOrganizationData()
      await navigateTo({
        name: 'organizations-organizationKey-issues',
        params: { organizationKey: input.organizationKey },
      })
    },
    result,
  })
}
</script>
