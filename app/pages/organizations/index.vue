<template>
  <OrganizationPickerPage :deps="deps" />
</template>

<script setup lang="ts">
import { openApiSelectOrganization } from '#infrastructure/organizations/select-organization/openApiSelectOrganization'
import { openApiViewOrganizationPickerPage } from '#infrastructure/organizations/select-organization/openApiViewOrganizationPickerPage'
import OrganizationPickerPage from '~/sections/organizations/select-organization/OrganizationPickerPage.vue'

definePageMeta({ layout: false })
const config = useRuntimeConfig()
const deps = {
  selectOrganization: openApiSelectOrganization(config.public.boardsApiBaseUrl),
  viewOrganizationPickerPage: openApiViewOrganizationPickerPage(
    config.public.boardsApiBaseUrl,
  ),
}
</script>
