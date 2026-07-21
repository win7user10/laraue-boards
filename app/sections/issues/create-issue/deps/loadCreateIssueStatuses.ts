type LoadCreateIssueStatusesResult = {
  statuses: Array<{ label: string; value: string }>
}

type LoadCreateIssueStatusesError =
  | 'AccessDenied'
  | 'BoardNotFound'
  | 'TemporarilyUnavailable'

export type LoadCreateIssueStatuses = (input: {
  boardId: string
}) => Promise<
  ActionResult<LoadCreateIssueStatusesResult, LoadCreateIssueStatusesError>
>
