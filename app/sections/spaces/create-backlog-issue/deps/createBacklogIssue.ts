type CreateBacklogIssueResult = { issueKey: string }

type CreateBacklogIssueError =
  | 'AccessDenied'
  | 'StatusNotFound'
  | 'TemporarilyUnavailable'
  | InvalidInputError

export type CreateBacklogIssue = (input: {
  assigneeId: string
  attributeValues: Array<
    | { attributeId: string; type: 'list'; valueId: string }
    | { attributeId: string; type: 'text'; value: string }
  >
  content: string
  statusId: string
}) => Promise<ActionResult<CreateBacklogIssueResult, CreateBacklogIssueError>>
