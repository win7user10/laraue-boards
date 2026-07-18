type MoveBoardIssueResult = null

export type MoveBoardIssueError =
  | 'AccessDenied'
  | 'InvalidStatus'
  | 'ResourceNotFound'
  | 'TemporarilyUnavailable'

export type MoveBoardIssue = (input: {
  issueId: string
  statusId: string
}) => Promise<ActionResult<MoveBoardIssueResult, MoveBoardIssueError>>
