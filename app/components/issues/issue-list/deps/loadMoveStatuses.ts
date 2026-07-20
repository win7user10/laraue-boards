type LoadMoveStatusesResult = {
  statuses: Array<{ id: string; name: string }>
}

type LoadMoveStatusesError =
  | 'AccessDenied'
  | 'BoardNotFound'
  | 'TemporarilyUnavailable'

export type LoadMoveStatuses = (input: {
  boardId: string
}) => Promise<ActionResult<LoadMoveStatusesResult, LoadMoveStatusesError>>
