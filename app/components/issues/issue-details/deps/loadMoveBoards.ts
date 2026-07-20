type LoadMoveBoardsResult = {
  boards: Array<{ label: string; value: string }>
}

export type LoadMoveBoardsError =
  | 'AccessDenied'
  | 'SpaceNotFound'
  | 'TemporarilyUnavailable'

export type LoadMoveBoards = (input: {
  spaceId: string
}) => Promise<ActionResult<LoadMoveBoardsResult, LoadMoveBoardsError>>
