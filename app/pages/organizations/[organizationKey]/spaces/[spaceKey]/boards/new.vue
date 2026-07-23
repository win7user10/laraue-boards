<template>
  <CreateBoardPage
    :back-to="organizationRoutes.space(spaceKey)"
    :deps="deps"
    :on-created="onCreated"
    :space-key="spaceKey" />
</template>

<script setup lang="ts">
import { createCreateBoardPageDeps } from '~/sections/boards/create-board/CreateBoardPage.deps.impl'
import CreateBoardPage from '~/sections/boards/create-board/CreateBoardPage.vue'

const route = useRoute(
  'organizations-organizationKey-spaces-spaceKey-boards-new',
)
const spaceKey = computed(() => String(route.params.spaceKey))
const organizationRoutes = useOrganizationRoutes()
const client = useApiClient()
const deps = createCreateBoardPageDeps(client)
const onCreated = async (boardId: string): Promise<void> => {
  await navigateTo(organizationRoutes.board(spaceKey.value, boardId))
}
</script>
