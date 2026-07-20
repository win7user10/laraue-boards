type MoveIssueResult = null

type MoveIssueError =
  | 'AccessDenied'
  | 'InvalidStatus'
  | 'ResourceNotFound'
  | 'TemporarilyUnavailable'

export type MoveIssue = (input: {
  issueKey: string
  statusId: string
}) => Promise<ActionResult<MoveIssueResult, MoveIssueError>>
