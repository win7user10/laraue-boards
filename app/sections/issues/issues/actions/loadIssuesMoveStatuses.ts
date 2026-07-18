type LoadIssuesMoveStatusesResult = {
  statuses: Array<{ id: string; name: string }>
}

type LoadIssuesMoveStatusesError =
  | 'AccessDenied'
  | 'BoardNotFound'
  | 'TemporarilyUnavailable'

export type LoadIssuesMoveStatuses = (input: {
  boardId: string
}) => Promise<
  ActionResult<LoadIssuesMoveStatusesResult, LoadIssuesMoveStatusesError>
>
