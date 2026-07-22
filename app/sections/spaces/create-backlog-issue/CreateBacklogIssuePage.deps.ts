import type { Result } from '~/utils/actionResult'

export type BacklogIssueAttribute =
  | { color: string; id: string; name: string; type: 'text' }
  | {
      color: string
      id: string
      name: string
      options: Array<{ label: string; value: string }>
      type: 'list'
    }

export type BacklogIssueAssignee = {
  color: string
  initials: string
  label: string
  value: string
}

export type CreateBacklogIssuePageData = {
  attributes: BacklogIssueAttribute[]
  boardName: string
  spaceId: string
  statusId: string
}

export type ViewBacklogIssueFailure =
  | { type: 'accessDenied' }
  | { type: 'backlogNotFound' }
  | { type: 'spaceNotFound' }
  | { type: 'temporarilyUnavailable' }

export type LoadBacklogAssigneesFailure =
  | { type: 'accessDenied' }
  | { type: 'spaceNotFound' }
  | { type: 'temporarilyUnavailable' }

export type CreateBacklogIssueFailure =
  | { message: string; type: 'invalidInput' }
  | { type: 'accessDenied' }
  | { type: 'statusNotFound' }
  | { type: 'temporarilyUnavailable' }

type AttributeValueInput =
  | { attributeId: string; type: 'list'; valueId: string }
  | { attributeId: string; type: 'text'; value: string }

export type CreateBacklogIssuePageDeps = {
  create: (input: {
    assigneeId: string
    attributeValues: AttributeValueInput[]
    content: string
    files: File[]
    statusId: string
  }) => Promise<Result<{ issueKey: string }, CreateBacklogIssueFailure>>
  loadAssignees: (input: {
    spaceId: string
  }) => Promise<Result<BacklogIssueAssignee[], LoadBacklogAssigneesFailure>>
  view: (input: {
    signal?: AbortSignal
    spaceKey: string
  }) => Promise<Result<CreateBacklogIssuePageData, ViewBacklogIssueFailure>>
}
