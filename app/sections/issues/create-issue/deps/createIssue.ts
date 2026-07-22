type CreateIssueResult = { issueKey: string }

type CreateIssueError =
  | 'AccessDenied'
  | 'StatusNotFound'
  | 'TemporarilyUnavailable'
  | InvalidInputError

export type CreateIssue = (input: {
  assigneeId: string
  attributeValues: Array<
    | { attributeId: string; type: 'list'; valueId: string }
    | { attributeId: string; type: 'text'; value: string }
  >
  content: string
  files: File[]
  statusId: string
}) => Promise<ActionResult<CreateIssueResult, CreateIssueError>>
