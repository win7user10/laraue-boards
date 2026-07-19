type DeleteBoardResult = null

type DeleteBoardError =
  | 'AccessDenied'
  | 'BoardNotFound'
  | 'TemporarilyUnavailable'

export type DeleteBoard = (input: {
  boardId: string
}) => Promise<ActionResult<DeleteBoardResult, DeleteBoardError>>
