type DeleteSpaceResult = null

type DeleteSpaceError =
  | 'AccessDenied'
  | 'SpaceNotFound'
  | 'TemporarilyUnavailable'

export type DeleteSpace = (input: {
  spaceId: string
}) => Promise<ActionResult<DeleteSpaceResult, DeleteSpaceError>>
