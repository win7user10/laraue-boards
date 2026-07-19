<template>
  <CreateBoardPageApplication
    :deps="deps"
    :space-key="spaceKey" />
</template>
<script setup lang="ts">
import { openApiCreateBoard } from '~~/infrastructure/boards/create-board/openApiCreateBoard'

import CreateBoardPageApplication from '~/sections/boards/create-board/CreateBoardPageApplication.vue'
const route = useRoute(
  'organizations-organizationKey-spaces-spaceKey-boards-new',
)
const spaceKey = computed(() => String(route.params.spaceKey))
const config = useRuntimeConfig()
const deps = {
  createBoard: openApiCreateBoard(config.public.boardsApiBaseUrl),
}
</script>
