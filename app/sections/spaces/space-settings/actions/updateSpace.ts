type UpdateSpaceResult = null

type UpdateSpaceError =
  | 'AccessDenied'
  | 'SpaceNotFound'
  | 'TemporarilyUnavailable'
  | InvalidInputError

export type UpdateSpace = (input: {
  color: string
  key: string
  name: string
  spaceId: string
}) => Promise<ActionResult<UpdateSpaceResult, UpdateSpaceError>>
