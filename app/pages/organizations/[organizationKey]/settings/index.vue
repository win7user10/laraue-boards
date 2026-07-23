<template>
  <OrganizationSettingsPage
    :deps="deps"
    :on-updated="refreshAppLayoutData" />
</template>

<script setup lang="ts">
import { createOrganizationSettingsPageDeps } from '~/sections/organizations/settings/OrganizationSettingsPage.deps.impl'
import OrganizationSettingsPage from '~/sections/organizations/settings/OrganizationSettingsPage.vue'

const client = useApiClient()
const deps = createOrganizationSettingsPageDeps(client)
</script>
