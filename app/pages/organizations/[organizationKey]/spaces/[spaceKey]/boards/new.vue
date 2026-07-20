<template>
  <CreateBoardPage
    :deps="deps"
    :space-key="spaceKey" />
</template>

<script setup lang="ts">
import { openApiCreateBoard } from '#infrastructure/boards/create-board/openApiCreateBoard'
import CreateBoardPage from '~/sections/boards/create-board/CreateBoardPage.vue'
const route = useRoute(
  'organizations-organizationKey-spaces-spaceKey-boards-new',
)
const spaceKey = computed(() => String(route.params.spaceKey))
const config = useRuntimeConfig()
const deps = {
  createBoard: openApiCreateBoard(config.public.boardsApiBaseUrl),
}
</script>
