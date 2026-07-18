type LoadCreateBoardIssueAssigneesResult = {
  assignees: Array<{ label: string; value: string }>
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
