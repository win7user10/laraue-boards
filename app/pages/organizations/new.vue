<template>
  <CreateOrganizationPage :deps="deps" />
</template>

<script setup lang="ts">
import { openApiCreateOrganization } from '#infrastructure/organizations/create-organization/openApiCreateOrganization'
import CreateOrganizationPage from '~/sections/organizations/create-organization/CreateOrganizationPage.vue'

definePageMeta({ layout: false })
const config = useRuntimeConfig()
const deps = {
  createOrganization: openApiCreateOrganization(config.public.boardsApiBaseUrl),
}
</script>
