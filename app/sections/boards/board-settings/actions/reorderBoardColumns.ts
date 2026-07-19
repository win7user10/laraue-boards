type ReorderBoardColumnsResult = null

type ReorderBoardColumnsError =
  | 'AccessDenied'
  | 'BoardNotFound'
  | 'TemporarilyUnavailable'

export type ReorderBoardColumns = (input: {
  boardColumnIds: string[]
  boardId: string
}) => Promise<ActionResult<ReorderBoardColumnsResult, ReorderBoardColumnsError>>
