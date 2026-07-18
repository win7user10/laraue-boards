<template>
  <CreateBoardIssuePageApplication
    :board-id="boardId"
    :deps="deps"
    :space-key="spaceKey" />
</template>

<script setup lang="ts">
import { openApiCreateBoardIssue } from '~~/infrastructure/boards/create-issue/openApiCreateBoardIssue'
import { openApiLoadCreateBoardIssueAssignees } from '~~/infrastructure/boards/create-issue/openApiLoadCreateBoardIssueAssignees'
import { openApiViewCreateBoardIssuePage } from '~~/infrastructure/boards/create-issue/openApiViewCreateBoardIssuePage'

import CreateBoardIssuePageApplication from '~/sections/boards/create-issue/CreateBoardIssuePageApplication.vue'

const route = useRoute(
  'organizations-organizationKey-spaces-spaceKey-boardId-issues-new',
)
const boardId = computed(() => String(route.params.boardId))
const spaceKey = computed(() => String(route.params.spaceKey))
const baseUrl = useRuntimeConfig().public.boardsApiBaseUrl
const deps = {
  createBoardIssue: openApiCreateBoardIssue(baseUrl),
  loadCreateBoardIssueAssignees: openApiLoadCreateBoardIssueAssignees(baseUrl),
  viewCreateBoardIssuePage: openApiViewCreateBoardIssuePage(baseUrl),
}
</script>
