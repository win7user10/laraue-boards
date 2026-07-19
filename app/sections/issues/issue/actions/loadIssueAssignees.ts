type LoadIssueAssigneesResult = {
  assignees: Array<{
    color: string
    initials: string
    label: string
    value: string
  }>
}

type LoadIssueAssigneesError =
  | 'AccessDenied'
  | 'SpaceNotFound'
  | 'TemporarilyUnavailable'

export type LoadIssueAssignees = (input: {
  spaceId: string
}) => Promise<ActionResult<LoadIssueAssigneesResult, LoadIssueAssigneesError>>
