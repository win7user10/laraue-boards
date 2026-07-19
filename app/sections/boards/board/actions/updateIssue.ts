type UpdateIssueResult = null

type UpdateIssueError =
  | 'AccessDenied'
  | 'IssueNotFound'
  | 'TemporarilyUnavailable'
  | InvalidInputError

export type UpdateIssue = (input: {
  assigneeId: string
  attributeValues: Array<
    | { attributeId: string; type: 'list'; valueId: string }
    | { attributeId: string; type: 'text'; value: string }
  >
  content: string
  issueId: string
}) => Promise<ActionResult<UpdateIssueResult, UpdateIssueError>>
