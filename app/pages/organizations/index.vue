<template>
  <OrganizationPickerPage
    :deps="deps"
    :on-access-denied="onAccessDenied"
    :on-selected="onSelected" />
</template>

<script setup lang="ts">
import { createOrganizationPickerPageDeps } from '~/sections/organizations/select-organization/OrganizationPickerPage.deps.impl'
import OrganizationPickerPage from '~/sections/organizations/select-organization/OrganizationPickerPage.vue'

definePageMeta({ layout: false })
const client = useApiClient()
const deps = createOrganizationPickerPageDeps(client)
const onAccessDenied = async (): Promise<void> => {
  await navigateTo('/')
}
const onSelected = async (organizationKey: string): Promise<void> => {
  await navigateTo({
    name: 'organizations-organizationKey-issues',
    params: { organizationKey },
  })
}
</script>
