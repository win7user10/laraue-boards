type MoveIssueToBacklogResult = null

export type MoveIssueToBacklogError =
  | 'AccessDenied'
  | 'AlreadyInBacklog'
  | 'ResourceNotFound'
  | 'TemporarilyUnavailable'

export type MoveIssueToBacklog = (input: {
  boardId: string
  issueKey: string
  spaceKey: string
}) => Promise<ActionResult<MoveIssueToBacklogResult, MoveIssueToBacklogError>>
