type MoveSpacesResult = null
type MoveSpacesError =
  | 'AccessDenied'
  | 'InvalidDestination'
  | 'ResourceNotFound'
  | 'TemporarilyUnavailable'

export type MoveSpaces = (input: {
  destinationOrganizationId: string
  spaceIds: string[]
}) => Promise<ActionResult<MoveSpacesResult, MoveSpacesError>>
