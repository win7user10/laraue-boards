type MoveBoardsResult = null
type MoveBoardsError =
  | 'AccessDenied'
  | 'InvalidDestination'
  | 'ResourceNotFound'
  | 'TemporarilyUnavailable'

export type MoveBoards = (input: {
  boardIds: string[]
  destinationSpaceId: string
}) => Promise<ActionResult<MoveBoardsResult, MoveBoardsError>>
