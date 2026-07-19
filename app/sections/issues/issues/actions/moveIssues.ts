type MoveIssuesResult = null

type MoveIssuesError =
  | 'AccessDenied'
  | 'InvalidStatus'
  | 'ResourceNotFound'
  | 'TemporarilyUnavailable'

export type MoveIssues = (input: {
  issueKeys: string[]
  statusId: string
}) => Promise<ActionResult<MoveIssuesResult, MoveIssuesError>>
