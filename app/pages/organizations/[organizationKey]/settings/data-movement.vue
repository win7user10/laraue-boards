<template>
  <DataMovementPage :deps="deps" />
</template>

<script setup lang="ts">
import { createDataMovementPageDeps } from '~/sections/organizations/data-movement/DataMovementPage.deps.impl'
import DataMovementPage from '~/sections/organizations/data-movement/DataMovementPage.vue'

const client = useApiClient()
const deps = createDataMovementPageDeps(client)
</script>
