type LoadAssigneesResult = {
  assignees: Array<{
    color: string
    initials: string
    label: string
    value: string
  }>
}

export type LoadAssigneesError =
  | 'AccessDenied'
  | 'SpaceNotFound'
  | 'TemporarilyUnavailable'

export type LoadAssignees = (input: {
  spaceId: string
}) => Promise<ActionResult<LoadAssigneesResult, LoadAssigneesError>>
