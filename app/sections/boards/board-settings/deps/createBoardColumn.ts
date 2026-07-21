type CreateBoardColumnResult = { boardColumnId: string }

type CreateBoardColumnError =
  | 'AccessDenied'
  | 'BoardNotFound'
  | 'TemporarilyUnavailable'
  | InvalidInputError

export type CreateBoardColumn = (input: {
  boardId: string
  color: string
  name: string
}) => Promise<ActionResult<CreateBoardColumnResult, CreateBoardColumnError>>
