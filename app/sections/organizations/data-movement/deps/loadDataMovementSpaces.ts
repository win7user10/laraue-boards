type LoadDataMovementSpacesResult = {
  spaces: Array<{ label: string; value: string }>
}

type LoadDataMovementSpacesError =
  | 'AccessDenied'
  | 'OrganizationNotFound'
  | 'TemporarilyUnavailable'

export type LoadDataMovementSpaces = (input: {
  organizationId: string
}) => Promise<
  ActionResult<LoadDataMovementSpacesResult, LoadDataMovementSpacesError>
>
