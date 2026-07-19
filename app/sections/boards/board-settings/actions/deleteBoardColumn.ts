type DeleteBoardColumnResult = null

type DeleteBoardColumnError =
  | 'AccessDenied'
  | 'BoardColumnNotFound'
  | 'TemporarilyUnavailable'
  | InvalidInputError

export type DeleteBoardColumn = (input: {
  boardColumnId: string
}) => Promise<ActionResult<DeleteBoardColumnResult, DeleteBoardColumnError>>
