<template>
  <CreateIssuePageApplication :deps="deps" />
</template>

<script setup lang="ts">
import { openApiCreateIssue } from '~~/infrastructure/issues/create-issue/openApiCreateIssue'
import { openApiLoadCreateIssueAssignees } from '~~/infrastructure/issues/create-issue/openApiLoadCreateIssueAssignees'
import { openApiLoadCreateIssueBoards } from '~~/infrastructure/issues/create-issue/openApiLoadCreateIssueBoards'
import { openApiLoadCreateIssueStatuses } from '~~/infrastructure/issues/create-issue/openApiLoadCreateIssueStatuses'
import { openApiViewCreateIssuePage } from '~~/infrastructure/issues/create-issue/openApiViewCreateIssuePage'

import CreateIssuePageApplication from '~/sections/issues/create-issue/CreateIssuePageApplication.vue'

const baseUrl = useRuntimeConfig().public.boardsApiBaseUrl
const deps = {
  createIssue: openApiCreateIssue(baseUrl),
  loadCreateIssueAssignees: openApiLoadCreateIssueAssignees(baseUrl),
  loadCreateIssueBoards: openApiLoadCreateIssueBoards(baseUrl),
  loadCreateIssueStatuses: openApiLoadCreateIssueStatuses(baseUrl),
  viewCreateIssuePage: openApiViewCreateIssuePage(baseUrl),
}
</script>
