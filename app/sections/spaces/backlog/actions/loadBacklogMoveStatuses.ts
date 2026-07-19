type LoadBacklogMoveStatusesResult = {
  statuses: Array<{ id: string; name: string }>
}

type LoadBacklogMoveStatusesError =
  | 'AccessDenied'
  | 'BoardNotFound'
  | 'TemporarilyUnavailable'

export type LoadBacklogMoveStatuses = (input: {
  boardId: string
}) => Promise<
  ActionResult<LoadBacklogMoveStatusesResult, LoadBacklogMoveStatusesError>
>
