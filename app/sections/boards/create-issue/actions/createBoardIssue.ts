type CreateBoardIssueResult = { issueKey: string }

type CreateBoardIssueError =
  | 'AccessDenied'
  | 'StatusNotFound'
  | 'TemporarilyUnavailable'
  | InvalidInputError

export type CreateBoardIssue = (input: {
  assigneeId: string
  attributeValues: Array<
    | { attributeId: string; type: 'list'; valueId: string }
    | { attributeId: string; type: 'text'; value: string }
  >
  content: string
  statusId: string
}) => Promise<ActionResult<CreateBoardIssueResult, CreateBoardIssueError>>
