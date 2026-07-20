<template>
  <BacklogPage
    :deps="deps"
    :space-key="spaceKey" />
</template>

<script setup lang="ts">
import { openApiLoadMoveBoards } from '#infrastructure/issues/issue-list/backlog/openApiLoadMoveBoards'
import { openApiLoadMoveSpaces } from '#infrastructure/issues/issue-list/backlog/openApiLoadMoveSpaces'
import { openApiLoadMoveStatuses } from '#infrastructure/issues/issue-list/backlog/openApiLoadMoveStatuses'
import { openApiMoveIssues } from '#infrastructure/issues/issue-list/backlog/openApiMoveIssues'
import { openApiSearchBacklogIssues } from '#infrastructure/spaces/backlog/openApiSearchBacklogIssues'
import { openApiViewBacklogPage } from '#infrastructure/spaces/backlog/openApiViewBacklogPage'
import BacklogPage from '~/sections/spaces/backlog/BacklogPage.vue'
import type { BacklogPageDeps } from '~/sections/spaces/backlog/BacklogPageDeps'
const route = useRoute('organizations-organizationKey-spaces-spaceKey-backlog')
const spaceKey = computed(() => String(route.params.spaceKey))
const config = useRuntimeConfig()
const baseUrl = config.public.boardsApiBaseUrl
const deps = {
  issueList: {
    loadMoveBoards: openApiLoadMoveBoards(baseUrl),
    loadMoveSpaces: openApiLoadMoveSpaces(baseUrl),
    loadMoveStatuses: openApiLoadMoveStatuses(baseUrl),
    moveIssues: openApiMoveIssues(baseUrl),
  },
  searchBacklogIssues: openApiSearchBacklogIssues(baseUrl),
  viewBacklogPage: openApiViewBacklogPage(baseUrl),
} satisfies BacklogPageDeps
</script>
