<template><OrganizationSettingsPageApplication :deps="deps" /></template>

<script setup lang="ts">
import { openApiUpdateOrganization } from '~~/infrastructure/organizations/settings/openApiUpdateOrganization'
import { openApiViewOrganizationSettingsPage } from '~~/infrastructure/organizations/settings/openApiViewOrganizationSettingsPage'

import OrganizationSettingsPageApplication from '~/sections/organizations/settings/OrganizationSettingsPageApplication.vue'

const config = useRuntimeConfig()
const baseUrl = config.public.boardsApiBaseUrl
const deps = {
  updateOrganization: openApiUpdateOrganization(baseUrl),
  viewOrganizationSettingsPage: openApiViewOrganizationSettingsPage(baseUrl),
}
</script>
