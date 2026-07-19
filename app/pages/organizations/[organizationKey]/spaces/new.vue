<template><CreateSpacePageApplication :deps="deps" /></template>
<script setup lang="ts">
import { openApiCreateSpace } from '~~/infrastructure/spaces/create-space/openApiCreateSpace'

import CreateSpacePageApplication from '~/sections/spaces/create-space/CreateSpacePageApplication.vue'
const config = useRuntimeConfig()
const deps = {
  createSpace: openApiCreateSpace(config.public.boardsApiBaseUrl),
}
</script>
