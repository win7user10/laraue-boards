type LoadCreateBacklogIssueAssigneesResult = {
  assignees: Array<{
    color: string
    initials: string
    label: string
    value: string
  }>
}

type LoadCreateBacklogIssueAssigneesError =
  | 'AccessDenied'
  | 'SpaceNotFound'
  | 'TemporarilyUnavailable'

export type LoadCreateBacklogIssueAssignees = (input: {
  spaceId: string
}) => Promise<
  ActionResult<
    LoadCreateBacklogIssueAssigneesResult,
    LoadCreateBacklogIssueAssigneesError
  >
>
