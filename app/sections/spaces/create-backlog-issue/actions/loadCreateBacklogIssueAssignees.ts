type LoadCreateBacklogIssueAssigneesResult = {
  assignees: Array<{ label: string; value: string }>
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
