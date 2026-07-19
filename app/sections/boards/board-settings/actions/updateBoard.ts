type UpdateBoardResult = null

type UpdateBoardError =
  | 'AccessDenied'
  | 'BoardNotFound'
  | 'TemporarilyUnavailable'
  | InvalidInputError

export type UpdateBoard = (input: {
  boardId: string
  color: string
  name: string
}) => Promise<ActionResult<UpdateBoardResult, UpdateBoardError>>
