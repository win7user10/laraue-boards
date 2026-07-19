<template>
  <IssuePageApplication
    :deps="deps"
    :issue-key="issueKey" />
</template>
<script setup lang="ts">
import { openApiDeleteIssue } from '~~/infrastructure/issues/issue/openApiDeleteIssue'
import { openApiLoadIssueAssignees } from '~~/infrastructure/issues/issue/openApiLoadIssueAssignees'
import { openApiLoadIssueMoveBoards } from '~~/infrastructure/issues/issue/openApiLoadIssueMoveBoards'
import { openApiLoadIssueMoveSpaces } from '~~/infrastructure/issues/issue/openApiLoadIssueMoveSpaces'
import { openApiLoadIssueStatuses } from '~~/infrastructure/issues/issue/openApiLoadIssueStatuses'
import { openApiMoveIssue } from '~~/infrastructure/issues/issue/openApiMoveIssue'
import { openApiUpdateIssue } from '~~/infrastructure/issues/issue/openApiUpdateIssue'
import { openApiViewIssuePage } from '~~/infrastructure/issues/issue/openApiViewIssuePage'

import IssuePageApplication from '~/sections/issues/issue/IssuePageApplication.vue'
const route = useRoute('organizations-organizationKey-issues-issueKey')
const issueKey = computed(() => String(route.params.issueKey))
const config = useRuntimeConfig()
const baseUrl = config.public.boardsApiBaseUrl
const deps = {
  deleteIssue: openApiDeleteIssue(baseUrl),
  loadIssueAssignees: openApiLoadIssueAssignees(baseUrl),
  loadIssueMoveBoards: openApiLoadIssueMoveBoards(baseUrl),
  loadIssueMoveSpaces: openApiLoadIssueMoveSpaces(baseUrl),
  loadIssueStatuses: openApiLoadIssueStatuses(baseUrl),
  moveIssue: openApiMoveIssue(baseUrl),
  updateIssue: openApiUpdateIssue(baseUrl),
  viewIssuePage: openApiViewIssuePage(baseUrl),
}
</script>
