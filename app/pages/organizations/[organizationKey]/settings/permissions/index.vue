<template>
  <PermissionsPage :deps="deps" />
</template>

<script setup lang="ts">
import { createPermissionsPageDeps } from '~/sections/organizations/permissions/list-members/PermissionsPage.deps.impl'
import PermissionsPage from '~/sections/organizations/permissions/list-members/PermissionsPage.vue'

const client = useApiClient()
const deps = createPermissionsPageDeps(client)
</script>
