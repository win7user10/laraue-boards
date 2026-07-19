<template>
  <BoardSettingsPageApplication
    :board-id="boardId"
    :deps="deps"
    :space-key="spaceKey" />
</template>

<script setup lang="ts">
import { openApiCreateBoardColumn } from '~~/infrastructure/boards/board-settings/openApiCreateBoardColumn'
import { openApiDeleteBoard } from '~~/infrastructure/boards/board-settings/openApiDeleteBoard'
import { openApiDeleteBoardColumn } from '~~/infrastructure/boards/board-settings/openApiDeleteBoardColumn'
import { openApiReorderBoardColumns } from '~~/infrastructure/boards/board-settings/openApiReorderBoardColumns'
import { openApiUpdateBoard } from '~~/infrastructure/boards/board-settings/openApiUpdateBoard'
import { openApiUpdateBoardColumn } from '~~/infrastructure/boards/board-settings/openApiUpdateBoardColumn'
import { openApiViewBoardSettingsPage } from '~~/infrastructure/boards/board-settings/openApiViewBoardSettingsPage'

import BoardSettingsPageApplication from '~/sections/boards/board-settings/BoardSettingsPageApplication.vue'

const route = useRoute(
  'organizations-organizationKey-spaces-spaceKey-boardId-settings',
)
const boardId = computed(() => String(route.params.boardId))
const spaceKey = computed(() => String(route.params.spaceKey))
const config = useRuntimeConfig()
const baseUrl = config.public.boardsApiBaseUrl
const deps = {
  createBoardColumn: openApiCreateBoardColumn(baseUrl),
  deleteBoard: openApiDeleteBoard(baseUrl),
  deleteBoardColumn: openApiDeleteBoardColumn(baseUrl),
  reorderBoardColumns: openApiReorderBoardColumns(baseUrl),
  updateBoard: openApiUpdateBoard(baseUrl),
  updateBoardColumn: openApiUpdateBoardColumn(baseUrl),
  viewBoardSettingsPage: openApiViewBoardSettingsPage(baseUrl),
}
</script>
