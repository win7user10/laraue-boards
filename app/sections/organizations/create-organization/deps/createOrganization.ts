type CreateOrganizationResult = { organizationId: string }

type CreateOrganizationError =
  | 'AccessDenied'
  | 'TemporarilyUnavailable'
  | InvalidInputError

export type CreateOrganization = (input: {
  color: string
  name: string
  slug: string
}) => Promise<ActionResult<CreateOrganizationResult, CreateOrganizationError>>
