import type { IssueListDeps } from '~/components/issue-list/deps'
import type { Result } from '~/utils/actionResult'

export type BacklogIssue = {
  assignee: string
  assigneeColor: string
  assigneeInitial: string
  boardColor: string
  boardName: string
  canMove: boolean
  content: string
  issueKey: string
  status: string
  statusColor: string
}

type BacklogAttribute =
  | { color: string; id: string; name: string; type: 'text' }
  | {
      color: string
      id: string
      name: string
      options: Array<{ label: string; value: string }>
      type: 'list'
    }

type BacklogPageData = {
  attributes: BacklogAttribute[]
  backlogBoardId: string
  color: string
  hasNextPage: boolean
  issues: BacklogIssue[]
  spaceKey: string
  title: string
}

type BacklogFilter =
  | { attributeId: string; searchString: string; type: 'text' }
  | { attributeId: string; type: 'list'; valueIds: string[] }

export type ViewBacklogFailure =
  | { type: 'accessDenied' }
  | { type: 'spaceNotFound' }
  | { type: 'temporarilyUnavailable' }

export type BacklogPageDeps = {
  issueList: IssueListDeps
  search: (input: {
    backlogBoardId: string
    filters: BacklogFilter[]
    page: number
    search: string
  }) => Promise<Result<{ hasNextPage: boolean; issues: BacklogIssue[] }, ViewBacklogFailure>>
  view: (input: {
    attributeQuery: Record<string, string[]>
    page: number
    search: string
    signal?: AbortSignal
    spaceKey: string
  }) => Promise<Result<BacklogPageData, ViewBacklogFailure>>
}
