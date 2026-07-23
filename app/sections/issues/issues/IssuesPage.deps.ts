import type { Result } from '~/utils/actionResult'

export type IssuesPageIssue = {
  assignee: string
  assigneeColor: string
  assigneeInitial: string
  boardColor: string
  boardName: string
  canMove: boolean
  content: string
  issueKey: string
  spaceColor: string
  spaceName: string
  status: string
  statusColor: string
}

type IssuesPageAttribute =
  | { color: string; id: string; name: string; type: 'text' }
  | {
      color: string
      id: string
      name: string
      options: Array<{ label: string; value: string }>
      type: 'list'
    }

type IssuesPageData = {
  attributes: IssuesPageAttribute[]
  hasNextPage: boolean
  issues: IssuesPageIssue[]
  spaces: Array<{ label: string; value: string }>
}

type IssuesFilter =
  | { attributeId: string; searchString: string; type: 'text' }
  | { attributeId: string; type: 'list'; valueIds: string[] }

export type ViewIssuesFailure =
  | { type: 'accessDenied' }
  | { type: 'temporarilyUnavailable' }

export type LoadMoveBoardsFailure =
  | { type: 'accessDenied' }
  | { type: 'spaceNotFound' }
  | { type: 'temporarilyUnavailable' }

type LoadMoveSpacesFailure =
  | { type: 'accessDenied' }
  | { type: 'temporarilyUnavailable' }

export type LoadMoveStatusesFailure =
  | { type: 'accessDenied' }
  | { type: 'boardNotFound' }
  | { type: 'temporarilyUnavailable' }

export type MoveIssuesFailure =
  | { type: 'accessDenied' }
  | { type: 'invalidStatus' }
  | { type: 'resourceNotFound' }
  | { type: 'temporarilyUnavailable' }

export type IssuesPageDeps = {
  loadMoveBoards: (input: {
    spaceId: string
  }) => Promise<
    Result<
      { boards: Array<{ label: string; value: string }> },
      LoadMoveBoardsFailure
    >
  >
  loadMoveSpaces: () => Promise<
    Result<
      { spaces: Array<{ label: string; value: string }> },
      LoadMoveSpacesFailure
    >
  >
  loadMoveStatuses: (input: {
    boardId: string
  }) => Promise<
    Result<
      { statuses: Array<{ id: string; name: string }> },
      LoadMoveStatusesFailure
    >
  >
  moveIssues: (input: {
    issueKeys: string[]
    statusId: string
  }) => Promise<Result<void, MoveIssuesFailure>>
  search: (input: {
    filters: IssuesFilter[]
    page: number
    search: string
    spaceIds: string[]
  }) => Promise<
    Result<
      { hasNextPage: boolean; issues: IssuesPageIssue[] },
      ViewIssuesFailure
    >
  >
  view: (input: {
    attributeQuery: Record<string, string[]>
    page: number
    search: string
    signal?: AbortSignal
    spaceIds: string[]
  }) => Promise<Result<IssuesPageData, ViewIssuesFailure>>
}
