type LoadIssueStatusesResult = {
  statuses: Array<{ id: string; name: string }>
}

type LoadIssueStatusesError =
  | 'AccessDenied'
  | 'BoardNotFound'
  | 'TemporarilyUnavailable'

export type LoadIssueStatuses = (input: {
  boardId: string
}) => Promise<ActionResult<LoadIssueStatusesResult, LoadIssueStatusesError>>
