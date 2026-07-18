<template>
  <CreateOrganizationPageApplication :deps="deps" />
</template>

<script setup lang="ts">
import { openApiCreateOrganization } from '~~/infrastructure/organizations/create-organization/openApiCreateOrganization'

import CreateOrganizationPageApplication from '~/sections/organizations/create-organization/CreateOrganizationPageApplication.vue'

definePageMeta({ layout: false })
const config = useRuntimeConfig()
const deps = {
  createOrganization: openApiCreateOrganization(config.public.boardsApiBaseUrl),
}
</script>
