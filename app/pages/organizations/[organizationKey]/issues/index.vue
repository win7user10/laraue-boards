<template>
  <IssuesPageApplication :deps="deps" />
</template>

<script setup lang="ts">
import { openApiLoadIssuesMoveBoards } from '~~/infrastructure/issues/issues/openApiLoadIssuesMoveBoards'
import { openApiLoadIssuesMoveSpaces } from '~~/infrastructure/issues/issues/openApiLoadIssuesMoveSpaces'
import { openApiLoadIssuesMoveStatuses } from '~~/infrastructure/issues/issues/openApiLoadIssuesMoveStatuses'
import { openApiMoveIssues } from '~~/infrastructure/issues/issues/openApiMoveIssues'
import { openApiSearchIssues } from '~~/infrastructure/issues/issues/openApiSearchIssues'
import { openApiViewIssuesPage } from '~~/infrastructure/issues/issues/openApiViewIssuesPage'

import IssuesPageApplication from '~/sections/issues/issues/IssuesPageApplication.vue'
const config = useRuntimeConfig()
const baseUrl = config.public.boardsApiBaseUrl
const deps = {
  loadIssuesMoveBoards: openApiLoadIssuesMoveBoards(baseUrl),
  loadIssuesMoveSpaces: openApiLoadIssuesMoveSpaces(baseUrl),
  loadIssuesMoveStatuses: openApiLoadIssuesMoveStatuses(baseUrl),
  moveIssues: openApiMoveIssues(baseUrl),
  searchIssues: openApiSearchIssues(baseUrl),
  viewIssuesPage: openApiViewIssuesPage(baseUrl),
}
</script>
