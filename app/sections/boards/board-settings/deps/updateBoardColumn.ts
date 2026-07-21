type UpdateBoardColumnResult = null

type UpdateBoardColumnError =
  | 'AccessDenied'
  | 'BoardColumnNotFound'
  | 'TemporarilyUnavailable'
  | InvalidInputError

export type UpdateBoardColumn = (input: {
  boardColumnId: string
  color: string
  name: string
}) => Promise<ActionResult<UpdateBoardColumnResult, UpdateBoardColumnError>>
