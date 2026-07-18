type UpdateOrganizationResult = { slug: string }

type UpdateOrganizationError =
  | 'AccessDenied'
  | 'OrganizationNotFound'
  | 'TemporarilyUnavailable'
  | InvalidInputError

export type UpdateOrganization = (input: {
  color: string
  id: string
  name: string
  slug: string
}) => Promise<ActionResult<UpdateOrganizationResult, UpdateOrganizationError>>
