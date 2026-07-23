import type { BoardPageViewModel } from '~/sections/boards/board/BoardPage.vue'
import type { IssueDialogViewModel } from '~/sections/boards/board/components/IssueDialog/IssueDialog.vue'
import type { InvalidInputError, Result } from '~/utils/actionResult'

type IssueItem = {
  assigneeColor: string
  assigneeInitial: string
  assigneeName: string
  content: string
  issueKey: string
  time: string
}

type IssueFilter =
  | { attributeId: string; searchString: string; type: 'text' }
  | { attributeId: string; type: 'list'; valueIds: string[] }

export type LoadMoreBoardIssuesResult = {
  hasNext: boolean
  issues: IssueItem[]
}

export type SearchBoardIssuesResult = {
  BoardPage: {
    columns: Array<{
      hasNext: boolean
      id: string
      issueCount: number
      issues: IssueItem[]
    }>
    issueCount: number
  }
}

export type ViewBoardPageFailure =
  | 'AccessDenied'
  | 'BoardNotFound'
  | 'TemporarilyUnavailable'

type IssueDialogDeps = {
  deleteIssue: (input: {
    issueKey: string
  }) => Promise<
    Result<null, 'AccessDenied' | 'IssueNotFound' | 'TemporarilyUnavailable'>
  >
  issueDetails: {
    loadAssignees: (input: { spaceId: string }) => Promise<
      Result<
        {
          assignees: Array<{
            color: string
            initials: string
            label: string
            value: string
          }>
        },
        'AccessDenied' | 'SpaceNotFound' | 'TemporarilyUnavailable'
      >
    >
    loadMoveBoards: (input: {
      spaceId: string
    }) => Promise<
      Result<
        { boards: Array<{ label: string; value: string }> },
        'AccessDenied' | 'SpaceNotFound' | 'TemporarilyUnavailable'
      >
    >
    loadMoveSpaces: () => Promise<
      Result<
        { spaces: Array<{ label: string; value: string }> },
        'AccessDenied' | 'TemporarilyUnavailable'
      >
    >
    loadStatuses: (input: {
      boardId: string
    }) => Promise<
      Result<
        { statuses: Array<{ id: string; name: string }> },
        'AccessDenied' | 'BoardNotFound' | 'TemporarilyUnavailable'
      >
    >
  }
  loadIssue: (input: {
    issueKey: string
  }) => Promise<
    Result<
      { IssueDialog: IssueDialogViewModel },
      'AccessDenied' | 'IssueNotFound' | 'TemporarilyUnavailable'
    >
  >
  moveIssue: (input: {
    issueKey: string
    statusId: string
  }) => Promise<
    Result<
      null,
      | 'AccessDenied'
      | 'InvalidStatus'
      | 'ResourceNotFound'
      | 'TemporarilyUnavailable'
    >
  >
  updateIssue: (input: {
    assigneeId: string
    attributeValues: Array<
      | { attributeId: string; type: 'list'; valueId: string }
      | { attributeId: string; type: 'text'; value: string }
    >
    content: string
    files: File[]
    issueKey: string
    removeAttachmentIds: string[]
  }) => Promise<
    Result<
      null,
      | 'AccessDenied'
      | 'IssueNotFound'
      | 'TemporarilyUnavailable'
      | InvalidInputError
    >
  >
}

export type BoardPageDeps = {
  issueDialog: IssueDialogDeps
  loadMoreBoardIssues: (input: {
    filters: IssueFilter[]
    offset: number
    search: string
    statusId: string
    take: number
  }) => Promise<
    Result<LoadMoreBoardIssuesResult, 'AccessDenied' | 'TemporarilyUnavailable'>
  >
  moveBoardIssue: IssueDialogDeps['moveIssue']
  moveIssueToBacklog: (input: {
    boardId: string
    issueKey: string
    spaceKey: string
  }) => Promise<
    Result<
      null,
      | 'AccessDenied'
      | 'AlreadyInBacklog'
      | 'ResourceNotFound'
      | 'TemporarilyUnavailable'
    >
  >
  searchBoardIssues: (input: {
    boardId: string
    filters: IssueFilter[]
    search: string
    take: number
  }) => Promise<
    Result<
      SearchBoardIssuesResult,
      'AccessDenied' | 'BoardNotFound' | 'TemporarilyUnavailable'
    >
  >
  view: (input: {
    attributeQuery: Record<string, string[]>
    boardId: string
    search: string
    signal?: AbortSignal
  }) => Promise<Result<{ BoardPage: BoardPageViewModel }, ViewBoardPageFailure>>
}
