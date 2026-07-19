type LoadBacklogMoveBoardsResult = {
  boards: Array<{ label: string; value: string }>
}

type LoadBacklogMoveBoardsError =
  | 'AccessDenied'
  | 'SpaceNotFound'
  | 'TemporarilyUnavailable'

export type LoadBacklogMoveBoards = (input: {
  sourceBoardId: string
  spaceId: string
}) => Promise<
  ActionResult<LoadBacklogMoveBoardsResult, LoadBacklogMoveBoardsError>
>
