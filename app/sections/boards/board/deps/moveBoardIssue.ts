type MoveBoardIssueResult = null

export type MoveBoardIssueError =
  | 'AccessDenied'
  | 'InvalidStatus'
  | 'ResourceNotFound'
  | 'TemporarilyUnavailable'

export type MoveBoardIssue = (input: {
  issueKey: string
  statusId: string
}) => Promise<ActionResult<MoveBoardIssueResult, MoveBoardIssueError>>
