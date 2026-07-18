<template>
  <CreateBacklogIssuePageApplication
    :deps="deps"
    :space-key="spaceKey" />
</template>

<script setup lang="ts">
import { openApiCreateBacklogIssue } from '~~/infrastructure/spaces/create-backlog-issue/openApiCreateBacklogIssue'
import { openApiLoadCreateBacklogIssueAssignees } from '~~/infrastructure/spaces/create-backlog-issue/openApiLoadCreateBacklogIssueAssignees'
import { openApiViewCreateBacklogIssuePage } from '~~/infrastructure/spaces/create-backlog-issue/openApiViewCreateBacklogIssuePage'

import CreateBacklogIssuePageApplication from '~/sections/spaces/create-backlog-issue/CreateBacklogIssuePageApplication.vue'

const route = useRoute(
  'organizations-organizationKey-spaces-spaceKey-backlog-issues-new',
)
const spaceKey = computed(() => String(route.params.spaceKey))
const baseUrl = useRuntimeConfig().public.boardsApiBaseUrl
const deps = {
  createBacklogIssue: openApiCreateBacklogIssue(baseUrl),
  loadCreateBacklogIssueAssignees:
    openApiLoadCreateBacklogIssueAssignees(baseUrl),
  viewCreateBacklogIssuePage: openApiViewCreateBacklogIssuePage(baseUrl),
}
</script>
