import type { BoardPageViewModel } from '~/sections/boards/board/BoardPage.vue'
import type {
  IssueDialogDeps,
  MoveIssue,
} from '~/sections/boards/board/components/IssueDialog/IssueDialog.deps'
import type { Result } from '~/utils/actionResult'

type Failure<Type extends string> = Type extends string ? { type: Type } : never

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
  | Failure<'accessDenied'>
  | Failure<'boardNotFound'>
  | Failure<'temporarilyUnavailable'>

export type LoadBoardIssuesFailure = Failure<
  'accessDenied' | 'temporarilyUnavailable'
>

export type MoveIssueToBacklogFailure = Failure<
  | 'accessDenied'
  | 'alreadyInBacklog'
  | 'resourceNotFound'
  | 'temporarilyUnavailable'
>

export type BoardPageDeps = {
  issueDialog: IssueDialogDeps
  loadMoreBoardIssues: (input: {
    filters: IssueFilter[]
    offset: number
    search: string
    statusId: string
    take: number
  }) => Promise<Result<LoadMoreBoardIssuesResult, LoadBoardIssuesFailure>>
  moveBoardIssue: MoveIssue
  moveIssueToBacklog: (input: {
    boardId: string
    issueKey: string
    spaceKey: string
  }) => Promise<Result<null, MoveIssueToBacklogFailure>>
  searchBoardIssues: (input: {
    boardId: string
    filters: IssueFilter[]
    search: string
    take: number
  }) => Promise<
    Result<
      SearchBoardIssuesResult,
      Failure<'accessDenied' | 'boardNotFound' | 'temporarilyUnavailable'>
    >
  >
  view: (input: {
    attributeQuery: Record<string, string[]>
    boardId: string
    search: string
    signal?: AbortSignal
  }) => Promise<Result<{ BoardPage: BoardPageViewModel }, ViewBoardPageFailure>>
}
