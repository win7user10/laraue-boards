type LoadMoveBoardsResult = {
  boards: Array<{ label: string; value: string }>
}

type LoadMoveBoardsError =
  | 'AccessDenied'
  | 'SpaceNotFound'
  | 'TemporarilyUnavailable'

export type LoadMoveBoards = (input: {
  sourceBoardId: null | string
  spaceId: string
}) => Promise<ActionResult<LoadMoveBoardsResult, LoadMoveBoardsError>>
