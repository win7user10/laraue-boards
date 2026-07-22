<template>
  <PermissionsPage :deps="deps" />
</template>

<script setup lang="ts">
import { createApiClient } from '#infrastructure/api/client'
import { createPermissionsPageDeps } from '~/sections/organizations/permissions/list-members/PermissionsPage.deps.impl'
import PermissionsPage from '~/sections/organizations/permissions/list-members/PermissionsPage.vue'

const config = useRuntimeConfig()
const client = createApiClient({
  baseUrl: config.public.boardsApiBaseUrl,
  headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
})
const deps = createPermissionsPageDeps(client)
</script>
