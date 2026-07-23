import type { Result } from '~/utils/actionResult'

type BoardIssueAttribute =
  | { color: string; id: string; name: string; type: 'text' }
  | {
      color: string
      id: string
      name: string
      options: Array<{ label: string; value: string }>
      type: 'list'
    }

export type BoardIssueAssignee = {
  color: string
  initials: string
  label: string
  value: string
}

type CreateBoardIssuePageData = {
  attributes: BoardIssueAttribute[]
  boardName: string
  statuses: Array<{ label: string; value: string }>
}

export type ViewBoardIssueFailure =
  | { type: 'accessDenied' }
  | { type: 'boardNotFound' }
  | { type: 'temporarilyUnavailable' }

export type LoadBoardAssigneesFailure =
  | { type: 'accessDenied' }
  | { type: 'spaceNotFound' }
  | { type: 'temporarilyUnavailable' }

export type CreateBoardIssueFailure =
  | { message: string; type: 'invalidInput' }
  | { type: 'accessDenied' }
  | { type: 'statusNotFound' }
  | { type: 'temporarilyUnavailable' }

type AttributeValueInput =
  | { attributeId: string; type: 'list'; valueId: string }
  | { attributeId: string; type: 'text'; value: string }

export type CreateBoardIssuePageDeps = {
  create: (input: {
    assigneeId: string
    attributeValues: AttributeValueInput[]
    content: string
    files: File[]
    statusId: string
  }) => Promise<Result<{ issueKey: string }, CreateBoardIssueFailure>>
  loadAssignees: (input: {
    spaceKey: string
  }) => Promise<Result<BoardIssueAssignee[], LoadBoardAssigneesFailure>>
  view: (input: {
    boardId: string
    signal?: AbortSignal
  }) => Promise<Result<CreateBoardIssuePageData, ViewBoardIssueFailure>>
}
