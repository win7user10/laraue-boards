type SelectOrganizationResult = null

type SelectOrganizationError =
  | 'AccessDenied'
  | 'OrganizationNotFound'
  | 'TemporarilyUnavailable'

export type SelectOrganization = (input: {
  organizationId: string
}) => Promise<ActionResult<SelectOrganizationResult, SelectOrganizationError>>
