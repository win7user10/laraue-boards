<template><PermissionsPageApplication :deps="deps" /></template>

<script setup lang="ts">
import { openApiViewPermissionsPage } from '~~/infrastructure/organizations/permissions/list-members/openApiViewPermissionsPage'

import PermissionsPageApplication from '~/sections/organizations/permissions/list-members/PermissionsPageApplication.vue'

const baseUrl = useRuntimeConfig().public.boardsApiBaseUrl
const deps = {
  viewPermissionsPage: openApiViewPermissionsPage(baseUrl),
}
</script>
