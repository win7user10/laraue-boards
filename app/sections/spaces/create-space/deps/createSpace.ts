type CreateSpaceResult = { spaceKey: string }

type CreateSpaceError =
  | 'AccessDenied'
  | 'OrganizationNotFound'
  | 'TemporarilyUnavailable'
  | InvalidInputError

export type CreateSpace = (input: {
  color: string
  key: string
  name: string
}) => Promise<ActionResult<CreateSpaceResult, CreateSpaceError>>
