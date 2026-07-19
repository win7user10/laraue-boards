type MoveIssueResult = null

type MoveIssueError =
  | 'AccessDenied'
  | 'InvalidStatus'
  | 'ResourceNotFound'
  | 'TemporarilyUnavailable'

export type MoveIssue = (input: {
  issueId: string
  statusId: string
}) => Promise<ActionResult<MoveIssueResult, MoveIssueError>>
