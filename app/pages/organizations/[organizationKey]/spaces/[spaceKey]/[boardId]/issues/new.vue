<template>
  <CreateBoardIssuePage
    :board-id="boardId"
    :deps="deps"
    :on-created="onCreated"
    :space-key="spaceKey" />
</template>

<script setup lang="ts">
import { createCreateBoardIssuePageDeps } from '~/sections/boards/create-issue/CreateBoardIssuePage.deps.impl'
import CreateBoardIssuePage from '~/sections/boards/create-issue/CreateBoardIssuePage.vue'

const route = useRoute('organizations-organizationKey-spaces-spaceKey-boardId-issues-new')
const boardId = computed(() => String(route.params.boardId))
const spaceKey = computed(() => String(route.params.spaceKey))
const organizationRoutes = useOrganizationRoutes()
const client = useApiClient()
const deps = createCreateBoardIssuePageDeps(client)
const onCreated = async (): Promise<void> => {
  await navigateTo(organizationRoutes.board(spaceKey.value, boardId.value))
}
</script>
