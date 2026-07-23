import type { Result } from '~/utils/actionResult'

export type CreateIssueAttribute =
  | { color: string; id: string; name: string; type: 'text' }
  | {
      color: string
      id: string
      name: string
      options: CreateIssueOption[]
      type: 'list'
    }

export type CreateIssueOption = { label: string; value: string }

export type CreateIssuePageData = {
  attributes: CreateIssueAttribute[]
  boardId: string
  boards: CreateIssueOption[]
  spaceId: string
  spaces: CreateIssueOption[]
  statuses: CreateIssueOption[]
  statusId: string
}

export type CreateIssueAssignee = CreateIssueOption & {
  color: string
  initials: string
}

export type IssueAttributeValueInput =
  | { attributeId: string; type: 'list'; valueId: string }
  | { attributeId: string; type: 'text'; value: string }

export type ViewCreateIssueFailure =
  | { type: 'accessDenied' }
  | { type: 'temporarilyUnavailable' }

export type LoadSpaceDataFailure =
  | { type: 'accessDenied' }
  | { type: 'spaceNotFound' }
  | { type: 'temporarilyUnavailable' }

export type LoadStatusesFailure =
  | { type: 'accessDenied' }
  | { type: 'boardNotFound' }
  | { type: 'temporarilyUnavailable' }

export type CreateIssueFailure =
  | { message: string; type: 'invalidInput' }
  | { type: 'accessDenied' }
  | { type: 'statusNotFound' }
  | { type: 'temporarilyUnavailable' }

export type CreateIssuePageDeps = {
  create: (input: {
    assigneeId: string
    attributeValues: IssueAttributeValueInput[]
    content: string
    files: File[]
    statusId: string
  }) => Promise<Result<{ issueKey: string }, CreateIssueFailure>>
  loadAssignees: (input: {
    spaceId: string
  }) => Promise<Result<CreateIssueAssignee[], LoadSpaceDataFailure>>
  loadBoards: (input: {
    spaceId: string
  }) => Promise<
    Result<
      { boardId: string; boards: CreateIssueOption[] },
      LoadSpaceDataFailure
    >
  >
  loadStatuses: (input: {
    boardId: string
  }) => Promise<Result<CreateIssueOption[], LoadStatusesFailure>>
  view: (input: {
    signal?: AbortSignal
  }) => Promise<Result<CreateIssuePageData, ViewCreateIssueFailure>>
}
