type CreateBoardResult = { boardId: string }

type CreateBoardError =
  | 'AccessDenied'
  | 'SpaceNotFound'
  | 'TemporarilyUnavailable'
  | InvalidInputError

export type CreateBoard = (input: {
  color: string
  name: string
  spaceKey: string
}) => Promise<ActionResult<CreateBoardResult, CreateBoardError>>
