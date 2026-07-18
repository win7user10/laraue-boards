type LoadIssuesMoveBoardsResult = {
  boards: Array<{ label: string; value: string }>
}

type LoadIssuesMoveBoardsError =
  | 'AccessDenied'
  | 'SpaceNotFound'
  | 'TemporarilyUnavailable'

export type LoadIssuesMoveBoards = (input: {
  spaceId: string
}) => Promise<
  ActionResult<LoadIssuesMoveBoardsResult, LoadIssuesMoveBoardsError>
>
