<template>
  <BoardSettingsPage
    :board-id="boardId"
    :deps="deps"
    :on-deleted="onDeleted"
    :on-saved="onSaved"
    :space-key="spaceKey" />
</template>

<script setup lang="ts">
import { createBoardSettingsPageDeps } from '~/sections/boards/board-settings/BoardSettingsPage.deps.impl'
import BoardSettingsPage from '~/sections/boards/board-settings/BoardSettingsPage.vue'

const route = useRoute('organizations-organizationKey-spaces-spaceKey-boardId-settings')
const boardId = computed(() => String(route.params.boardId))
const spaceKey = computed(() => String(route.params.spaceKey))
const organizationRoutes = useOrganizationRoutes()
const client = useApiClient()
const deps = createBoardSettingsPageDeps(client)
const onDeleted = async (): Promise<void> => {
  await navigateTo(organizationRoutes.space(spaceKey.value))
}
const onSaved = async (): Promise<void> => {
  await navigateTo(organizationRoutes.board(spaceKey.value, boardId.value))
}
</script>
