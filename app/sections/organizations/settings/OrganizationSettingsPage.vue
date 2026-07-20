<template>
  <OrganizationSettingsContent
    v-if="pageState.type === 'ready'"
    :error="error"
    :on-submit="submit"
    :saved="saved"
    :submitting="submitting"
    :view-model="pageState.data.OrganizationSettingsPage" />
  <PageLoadState
    v-else
    :error-text="pageState.type === 'error' ? pageState.message : ''"
    :loading="pageState.type === 'pending'"
    loading-text="Loading settings…"
    :on-retry="refresh" />
</template>

<script setup lang="ts">
import OrganizationSettingsContent from '~/sections/organizations/settings/components/OrganizationSettingsContent.vue'
import type { OrganizationSettingsPageDeps } from '~/sections/organizations/settings/OrganizationSettingsPageDeps'

const props = defineProps<{ deps: OrganizationSettingsPageDeps }>()
const { refresh, state: pageState } = await useActionData({
  action: () => props.deps.viewOrganizationSettingsPage(),
  fallbackMessage: 'Could not load settings. Try again.',
  key: dataKeys.workspace.settings,
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
const { organizationKey } = useOrganizationRoutes()
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
      invalidateData({ scope: 'organizations' })
      await Promise.all([
        refresh(),
        refreshDataKey(dataKeys.workspace.layout(organizationKey.value)),
      ])
      saved.value = true
    },
    result,
  })
}
</script>
