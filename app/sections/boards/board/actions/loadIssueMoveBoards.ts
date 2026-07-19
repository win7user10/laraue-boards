type LoadIssueMoveBoardsResult = {
  boards: Array<{ label: string; value: string }>
}

type LoadIssueMoveBoardsError =
  | 'AccessDenied'
  | 'SpaceNotFound'
  | 'TemporarilyUnavailable'

export type LoadIssueMoveBoards = (input: {
  spaceId: string
}) => Promise<ActionResult<LoadIssueMoveBoardsResult, LoadIssueMoveBoardsError>>
