<template>
  <BoardPage
    :board-id="boardId"
    :deps="deps"
    :issue-key="issueKey"
    :space-key="spaceKey" />
</template>

<script setup lang="ts">
import { openApiDeleteIssue } from '#infrastructure/boards/board/issue-dialog/openApiDeleteIssue'
import { openApiLoadIssue } from '#infrastructure/boards/board/issue-dialog/openApiLoadIssue'
import { openApiUpdateIssue } from '#infrastructure/boards/board/issue-dialog/openApiUpdateIssue'
import { openApiLoadMoreBoardIssues } from '#infrastructure/boards/board/openApiLoadMoreBoardIssues'
import { openApiMoveBoardIssue } from '#infrastructure/boards/board/openApiMoveBoardIssue'
import { openApiMoveIssueToBacklog } from '#infrastructure/boards/board/openApiMoveIssueToBacklog'
import { openApiSearchBoardIssues } from '#infrastructure/boards/board/openApiSearchBoardIssues'
import { openApiViewBoardPage } from '#infrastructure/boards/board/openApiViewBoardPage'
import { openApiLoadAssignees } from '#infrastructure/issues/issue-details/openApiLoadAssignees'
import { openApiLoadMoveBoards } from '#infrastructure/issues/issue-details/openApiLoadMoveBoards'
import { openApiLoadMoveSpaces } from '#infrastructure/issues/issue-details/openApiLoadMoveSpaces'
import { openApiLoadStatuses } from '#infrastructure/issues/issue-details/openApiLoadStatuses'
import BoardPage from '~/sections/boards/board/BoardPage.vue'
import type { BoardPageDeps } from '~/sections/boards/board/BoardPageDeps'

const route = useRoute('organizations-organizationKey-spaces-spaceKey-boardId')
const boardId = computed(() => String(route.params.boardId))
const spaceKey = computed(() => String(route.params.spaceKey))
const issueKey = computed(() =>
  typeof route.query.issue === 'string' ? route.query.issue : null,
)
const config = useRuntimeConfig()
const baseUrl = config.public.boardsApiBaseUrl
const moveBoardIssue = openApiMoveBoardIssue(baseUrl)
const deps = {
  issueDialog: {
    deleteIssue: openApiDeleteIssue(baseUrl),
    issueDetails: {
      loadAssignees: openApiLoadAssignees(baseUrl),
      loadMoveBoards: openApiLoadMoveBoards(baseUrl),
      loadMoveSpaces: openApiLoadMoveSpaces(baseUrl),
      loadStatuses: openApiLoadStatuses(baseUrl),
    },
    loadIssue: openApiLoadIssue(baseUrl),
    moveIssue: moveBoardIssue,
    updateIssue: openApiUpdateIssue(baseUrl),
  },
  loadMoreBoardIssues: openApiLoadMoreBoardIssues(baseUrl),
  moveBoardIssue,
  moveIssueToBacklog: openApiMoveIssueToBacklog(baseUrl),
  searchBoardIssues: openApiSearchBoardIssues(baseUrl),
  viewBoardPage: openApiViewBoardPage(baseUrl),
} satisfies BoardPageDeps
</script>
