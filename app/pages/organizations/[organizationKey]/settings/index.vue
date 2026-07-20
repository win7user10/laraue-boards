<template>
  <OrganizationSettingsPage :deps="deps" />
</template>

<script setup lang="ts">
import { openApiUpdateOrganization } from '#infrastructure/organizations/settings/openApiUpdateOrganization'
import { openApiViewOrganizationSettingsPage } from '#infrastructure/organizations/settings/openApiViewOrganizationSettingsPage'
import OrganizationSettingsPage from '~/sections/organizations/settings/OrganizationSettingsPage.vue'

const config = useRuntimeConfig()
const baseUrl = config.public.boardsApiBaseUrl
const deps = {
  updateOrganization: openApiUpdateOrganization(baseUrl),
  viewOrganizationSettingsPage: openApiViewOrganizationSettingsPage(baseUrl),
}
</script>
