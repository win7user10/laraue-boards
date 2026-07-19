type DeleteIssueResult = null

type DeleteIssueError =
  | 'AccessDenied'
  | 'IssueNotFound'
  | 'TemporarilyUnavailable'

export type DeleteIssue = (input: {
  issueId: string
}) => Promise<ActionResult<DeleteIssueResult, DeleteIssueError>>
