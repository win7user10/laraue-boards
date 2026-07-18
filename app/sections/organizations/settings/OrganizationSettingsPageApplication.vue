<template>
  <OrganizationSettingsPage
    v-if="pageState.type === 'ready'"
    :error="error"
    :saved="saved"
    :submitting="submitting"
    :view-model="pageState.data.OrganizationSettingsPage"
    @submit="submit" />
  <PageLoadState
    v-else
    :error-text="pageState.type === 'error' ? pageState.message : ''"
    :loading="pageState.type === 'pending'"
    loading-text="Loading settings…"
    @retry="refresh()" />
</template>

<script setup lang="ts">
import type { OrganizationSettingsPageApplicationDeps } from './OrganizationSettingsPageApplicationDeps'
import OrganizationSettingsPage from './view/OrganizationSettingsPage.vue'

const props = defineProps<{ deps: OrganizationSettingsPageApplicationDeps }>()
const { refresh, state: pageState } = await useActionData({
  action: () => props.deps.viewOrganizationSettingsPage(),
  fallbackMessage: 'Could not load settings. Try again.',
  key: asyncDataKeys.workspace.settings,
  messages: {
    AccessDenied: 'You do not have access to this organization.',
    OrganizationNotFound: 'The organization was not found.',
    TemporarilyUnavailable:
      'Could not load settings. The service is temporarily unavailable.',
  },
})
useHead({
  title: computed(() =>
    pageState.value.type === 'ready'
      ? `${pageState.value.data.OrganizationSettingsPage.name} settings`
      : 'Settings',
  ),
})
const submitting = ref(false)
const saved = ref(false)
const error = ref<null | string>(null)
const invalidation = useAsyncDataInvalidation()
async function submit(input: {
  color: string
  id: string
  name: string
  slug: string
}) {
  submitting.value = true
  saved.value = false
  error.value = null
  const result = await props.deps.updateOrganization(input)
  submitting.value = false
  await matchActionResult({
    err: async (actionError) => {
      error.value = getErrorMessage({
        error: actionError,
        messages: {
          AccessDenied:
            'You do not have permission to update this organization.',
          OrganizationNotFound: 'The organization was not found.',
          TemporarilyUnavailable: 'Could not save changes. Try again.',
        },
      })
    },
    ok: async ({ slug }) => {
      if (pageState.value.type !== 'ready') {
        return
      }
      await navigateTo(
        {
          name: 'organizations-organizationKey-settings',
          params: {
            organizationKey: `${slug}-${pageState.value.data.OrganizationSettingsPage.slugPostfix}`,
          },
        },
        { replace: true },
      )
      await Promise.all([refresh(), invalidation.invalidateOrganizationData()])
      saved.value = true
    },
    result,
  })
}
</script>
