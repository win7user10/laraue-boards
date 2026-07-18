<template>
  <BacklogPageApplication
    :deps="deps"
    :space-key="spaceKey" />
</template>
<script setup lang="ts">
import { openApiLoadBacklogMoveBoards } from '~~/infrastructure/spaces/backlog/openApiLoadBacklogMoveBoards'
import { openApiLoadBacklogMoveSpaces } from '~~/infrastructure/spaces/backlog/openApiLoadBacklogMoveSpaces'
import { openApiLoadBacklogMoveStatuses } from '~~/infrastructure/spaces/backlog/openApiLoadBacklogMoveStatuses'
import { openApiMoveBacklogIssues } from '~~/infrastructure/spaces/backlog/openApiMoveBacklogIssues'
import { openApiSearchBacklogIssues } from '~~/infrastructure/spaces/backlog/openApiSearchBacklogIssues'
import { openApiViewBacklogPage } from '~~/infrastructure/spaces/backlog/openApiViewBacklogPage'

import BacklogPageApplication from '~/sections/spaces/backlog/BacklogPageApplication.vue'
const route = useRoute('organizations-organizationKey-spaces-spaceKey-backlog')
const spaceKey = computed(() => String(route.params.spaceKey))
const config = useRuntimeConfig()
const baseUrl = config.public.boardsApiBaseUrl
const deps = {
  loadBacklogMoveBoards: openApiLoadBacklogMoveBoards(baseUrl),
  loadBacklogMoveSpaces: openApiLoadBacklogMoveSpaces(baseUrl),
  loadBacklogMoveStatuses: openApiLoadBacklogMoveStatuses(baseUrl),
  moveBacklogIssues: openApiMoveBacklogIssues(baseUrl),
  searchBacklogIssues: openApiSearchBacklogIssues(baseUrl),
  viewBacklogPage: openApiViewBacklogPage(baseUrl),
}
</script>
