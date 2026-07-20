type LoadCreateBoardIssueAssigneesResult = {
  assignees: Array<{
    color: string
    initials: string
    label: string
    value: string
  }>
}

type LoadCreateBoardIssueAssigneesError =
  | 'AccessDenied'
  | 'SpaceNotFound'
  | 'TemporarilyUnavailable'

export type LoadCreateBoardIssueAssignees = (input: {
  spaceKey: string
}) => Promise<
  ActionResult<
    LoadCreateBoardIssueAssigneesResult,
    LoadCreateBoardIssueAssigneesError
  >
>
