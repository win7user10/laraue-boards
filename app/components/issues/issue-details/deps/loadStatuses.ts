type LoadStatusesResult = {
  statuses: Array<{ id: string; name: string }>
}

export type LoadStatusesError =
  | 'AccessDenied'
  | 'BoardNotFound'
  | 'TemporarilyUnavailable'

export type LoadStatuses = (input: {
  boardId: string
}) => Promise<ActionResult<LoadStatusesResult, LoadStatusesError>>
