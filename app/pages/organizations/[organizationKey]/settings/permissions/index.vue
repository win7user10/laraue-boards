<template>
  <PermissionsPage :deps="deps" />
</template>

<script setup lang="ts">
import { openApiViewPermissionsPage } from '#infrastructure/organizations/permissions/list-members/openApiViewPermissionsPage'
import PermissionsPage from '~/sections/organizations/permissions/list-members/PermissionsPage.vue'

const baseUrl = useRuntimeConfig().public.boardsApiBaseUrl
const deps = {
  viewPermissionsPage: openApiViewPermissionsPage(baseUrl),
}
</script>
