<template>
  <CreateSpacePage :deps="deps" />
</template>

<script setup lang="ts">
import { openApiCreateSpace } from '#infrastructure/spaces/create-space/openApiCreateSpace'
import CreateSpacePage from '~/sections/spaces/create-space/CreateSpacePage.vue'
const config = useRuntimeConfig()
const deps = {
  createSpace: openApiCreateSpace(config.public.boardsApiBaseUrl),
}
</script>
