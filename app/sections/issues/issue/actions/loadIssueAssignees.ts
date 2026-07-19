type LoadIssueAssigneesResult = {
  assignees: Array<{ label: string; value: string }>
}

type LoadIssueAssigneesError =
  | 'AccessDenied'
  | 'SpaceNotFound'
  | 'TemporarilyUnavailable'

export type LoadIssueAssignees = (input: {
  spaceId: string
}) => Promise<ActionResult<LoadIssueAssigneesResult, LoadIssueAssigneesError>>
