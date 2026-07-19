type MoveIssuesResult = null

type MoveIssuesError =
  | 'AccessDenied'
  | 'InvalidStatus'
  | 'ResourceNotFound'
  | 'TemporarilyUnavailable'

export type MoveIssues = (input: {
  issueIds: string[]
  statusId: string
}) => Promise<ActionResult<MoveIssuesResult, MoveIssuesError>>
