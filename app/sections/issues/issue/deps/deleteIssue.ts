type DeleteIssueResult = null

type DeleteIssueError =
  | 'AccessDenied'
  | 'IssueNotFound'
  | 'TemporarilyUnavailable'

export type DeleteIssue = (input: {
  issueKey: string
}) => Promise<ActionResult<DeleteIssueResult, DeleteIssueError>>
