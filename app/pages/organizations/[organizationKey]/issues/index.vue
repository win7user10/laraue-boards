<template>
  <IssuesPage :deps="deps" />
</template>

<script setup lang="ts">
import { openApiLoadMoveBoards } from '#infrastructure/issues/issue-list/organization/openApiLoadMoveBoards'
import { openApiLoadMoveSpaces } from '#infrastructure/issues/issue-list/organization/openApiLoadMoveSpaces'
import { openApiLoadMoveStatuses } from '#infrastructure/issues/issue-list/organization/openApiLoadMoveStatuses'
import { openApiMoveIssues } from '#infrastructure/issues/issue-list/organization/openApiMoveIssues'
import { openApiSearchIssues } from '#infrastructure/issues/issues/openApiSearchIssues'
import { openApiViewIssuesPage } from '#infrastructure/issues/issues/openApiViewIssuesPage'
import IssuesPage from '~/sections/issues/issues/IssuesPage.vue'
import type { IssuesPageDeps } from '~/sections/issues/issues/IssuesPageDeps'
const config = useRuntimeConfig()
const baseUrl = config.public.boardsApiBaseUrl
const deps = {
  issueList: {
    loadMoveBoards: openApiLoadMoveBoards(baseUrl),
    loadMoveSpaces: openApiLoadMoveSpaces(baseUrl),
    loadMoveStatuses: openApiLoadMoveStatuses(baseUrl),
    moveIssues: openApiMoveIssues(baseUrl),
  },
  searchIssues: openApiSearchIssues(baseUrl),
  viewIssuesPage: openApiViewIssuesPage(baseUrl),
} satisfies IssuesPageDeps
</script>
