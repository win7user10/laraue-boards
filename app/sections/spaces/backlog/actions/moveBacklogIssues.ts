type MoveBacklogIssuesResult = null

type MoveBacklogIssuesError =
  | 'AccessDenied'
  | 'InvalidStatus'
  | 'ResourceNotFound'
  | 'TemporarilyUnavailable'

export type MoveBacklogIssues = (input: {
  issueKeys: string[]
  statusId: string
}) => Promise<ActionResult<MoveBacklogIssuesResult, MoveBacklogIssuesError>>
