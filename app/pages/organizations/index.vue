<template>
  <SelectOrganizationPageApplication :deps="deps" />
</template>

<script setup lang="ts">
import { openApiSelectOrganization } from '~~/infrastructure/organizations/select-organization/openApiSelectOrganization'
import { openApiViewOrganizationPickerPage } from '~~/infrastructure/organizations/select-organization/openApiViewOrganizationPickerPage'

import SelectOrganizationPageApplication from '~/sections/organizations/select-organization/SelectOrganizationPageApplication.vue'

definePageMeta({ layout: false })
const config = useRuntimeConfig()
const deps = {
  selectOrganization: openApiSelectOrganization(config.public.boardsApiBaseUrl),
  viewOrganizationPickerPage: openApiViewOrganizationPickerPage(
    config.public.boardsApiBaseUrl,
  ),
}
</script>
