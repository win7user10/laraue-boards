type LoadCreateIssueAssigneesResult = {
  assignees: Array<{ label: string; value: string }>
}

type LoadCreateIssueAssigneesError =
  | 'AccessDenied'
  | 'SpaceNotFound'
  | 'TemporarilyUnavailable'

export type LoadCreateIssueAssignees = (input: {
  spaceId: string
}) => Promise<
  ActionResult<LoadCreateIssueAssigneesResult, LoadCreateIssueAssigneesError>
>
