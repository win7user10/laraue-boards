type LoadCreateIssueAssigneesResult = {
  assignees: Array<{
    color: string
    initials: string
    label: string
    value: string
  }>
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
