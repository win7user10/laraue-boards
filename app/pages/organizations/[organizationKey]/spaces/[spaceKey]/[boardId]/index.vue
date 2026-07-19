<template>
  <BoardPageApplication
    :board-id="boardId"
    :deps="deps"
    :issue-key="issueKey"
    :space-key="spaceKey" />
</template>

<script setup lang="ts">
import { openApiDeleteIssue } from '~~/infrastructure/boards/board/openApiDeleteIssue'
import { openApiLoadIssueDialog } from '~~/infrastructure/boards/board/openApiLoadIssueDialog'
import { openApiLoadIssueDialogAssignees } from '~~/infrastructure/boards/board/openApiLoadIssueDialogAssignees'
import { openApiLoadIssueMoveBoards } from '~~/infrastructure/boards/board/openApiLoadIssueMoveBoards'
import { openApiLoadIssueMoveSpaces } from '~~/infrastructure/boards/board/openApiLoadIssueMoveSpaces'
import { openApiLoadIssueStatuses } from '~~/infrastructure/boards/board/openApiLoadIssueStatuses'
import { openApiLoadMoreBoardIssues } from '~~/infrastructure/boards/board/openApiLoadMoreBoardIssues'
import { openApiMoveBoardIssue } from '~~/infrastructure/boards/board/openApiMoveBoardIssue'
import { openApiMoveIssueToBacklog } from '~~/infrastructure/boards/board/openApiMoveIssueToBacklog'
import { openApiSearchBoardIssues } from '~~/infrastructure/boards/board/openApiSearchBoardIssues'
import { openApiUpdateIssue } from '~~/infrastructure/boards/board/openApiUpdateIssue'
import { openApiViewBoardPage } from '~~/infrastructure/boards/board/openApiViewBoardPage'

import BoardPageApplication from '~/sections/boards/board/BoardPageApplication.vue'

const route = useRoute('organizations-organizationKey-spaces-spaceKey-boardId')
const boardId = computed(() => String(route.params.boardId))
const spaceKey = computed(() => String(route.params.spaceKey))
const issueKey = computed(() =>
  typeof route.query.issue === 'string' ? route.query.issue : null,
)
const config = useRuntimeConfig()
const baseUrl = config.public.boardsApiBaseUrl
const deps = {
  deleteIssue: openApiDeleteIssue(baseUrl),
  loadIssueDialog: openApiLoadIssueDialog(baseUrl),
  loadIssueDialogAssignees: openApiLoadIssueDialogAssignees(baseUrl),
  loadIssueMoveBoards: openApiLoadIssueMoveBoards(baseUrl),
  loadIssueMoveSpaces: openApiLoadIssueMoveSpaces(baseUrl),
  loadIssueStatuses: openApiLoadIssueStatuses(baseUrl),
  loadMoreBoardIssues: openApiLoadMoreBoardIssues(baseUrl),
  moveBoardIssue: openApiMoveBoardIssue(baseUrl),
  moveIssueToBacklog: openApiMoveIssueToBacklog(baseUrl),
  searchBoardIssues: openApiSearchBoardIssues(baseUrl),
  updateIssue: openApiUpdateIssue(baseUrl),
  viewBoardPage: openApiViewBoardPage(baseUrl),
}
</script>
