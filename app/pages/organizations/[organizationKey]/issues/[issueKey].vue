<template>
  <IssuePage
    :deps="deps"
    :issue-key="issueKey" />
</template>

<script setup lang="ts">
import { openApiLoadAssignees } from '#infrastructure/issues/issue-details/openApiLoadAssignees'
import { openApiLoadMoveBoards } from '#infrastructure/issues/issue-details/openApiLoadMoveBoards'
import { openApiLoadMoveSpaces } from '#infrastructure/issues/issue-details/openApiLoadMoveSpaces'
import { openApiLoadStatuses } from '#infrastructure/issues/issue-details/openApiLoadStatuses'
import { openApiDeleteIssue } from '#infrastructure/issues/issue/openApiDeleteIssue'
import { openApiMoveIssue } from '#infrastructure/issues/issue/openApiMoveIssue'
import { openApiUpdateIssue } from '#infrastructure/issues/issue/openApiUpdateIssue'
import { openApiViewIssuePage } from '#infrastructure/issues/issue/openApiViewIssuePage'
import { openApiAddIssueAttachments } from '#infrastructure/issues/shared/openApiAddIssueAttachments'
import IssuePage from '~/sections/issues/issue/IssuePage.vue'
const route = useRoute('organizations-organizationKey-issues-issueKey')
const issueKey = computed(() => String(route.params.issueKey))
const config = useRuntimeConfig()
const baseUrl = config.public.boardsApiBaseUrl
const deps = {
  addIssueAttachments: openApiAddIssueAttachments(baseUrl),
  deleteIssue: openApiDeleteIssue(baseUrl),
  issueDetails: {
    loadAssignees: openApiLoadAssignees(baseUrl),
    loadMoveBoards: openApiLoadMoveBoards(baseUrl),
    loadMoveSpaces: openApiLoadMoveSpaces(baseUrl),
    loadStatuses: openApiLoadStatuses(baseUrl),
  },
  moveIssue: openApiMoveIssue(baseUrl),
  updateIssue: openApiUpdateIssue(baseUrl),
  viewIssuePage: openApiViewIssuePage(baseUrl),
}
</script>
