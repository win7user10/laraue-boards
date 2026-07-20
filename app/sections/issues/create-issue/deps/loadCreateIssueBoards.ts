type LoadCreateIssueBoardsResult = {
  boardId: string
  boards: Array<{ label: string; value: string }>
}

type LoadCreateIssueBoardsError =
  | 'AccessDenied'
  | 'SpaceNotFound'
  | 'TemporarilyUnavailable'

export type LoadCreateIssueBoards = (input: {
  spaceId: string
}) => Promise<
  ActionResult<LoadCreateIssueBoardsResult, LoadCreateIssueBoardsError>
>
