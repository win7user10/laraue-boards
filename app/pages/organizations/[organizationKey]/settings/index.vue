<template>
  <OrganizationSettingsPage
    :deps="deps"
    :on-updated="refreshAppLayoutData" />
</template>

<script setup lang="ts">
import { createApiClient } from '#infrastructure/api/client'
import { createOrganizationSettingsPageDeps } from '~/sections/organizations/settings/OrganizationSettingsPage.deps.impl'
import OrganizationSettingsPage from '~/sections/organizations/settings/OrganizationSettingsPage.vue'

const config = useRuntimeConfig()
const client = createApiClient({
  baseUrl: config.public.boardsApiBaseUrl,
  headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
})
const deps = createOrganizationSettingsPageDeps(client)
</script>
