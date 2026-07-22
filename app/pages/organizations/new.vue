<template>
  <CreateOrganizationPage
    :deps="deps"
    :on-created="onCreated" />
</template>

<script setup lang="ts">
import { createCreateOrganizationPageDeps } from '~/sections/organizations/create-organization/CreateOrganizationPage.deps.impl'
import CreateOrganizationPage from '~/sections/organizations/create-organization/CreateOrganizationPage.vue'

definePageMeta({ layout: false })
const client = useApiClient()
const deps = createCreateOrganizationPageDeps(client)
const onCreated = async (): Promise<void> => {
  await navigateTo('/organizations')
}
</script>
