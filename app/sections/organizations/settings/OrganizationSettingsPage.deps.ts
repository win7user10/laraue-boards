import type { Result } from '~/utils/actionResult'

export type OrganizationSettingsPageData = {
  canUpdate: boolean
  color: string
  id: string
  name: string
  slug: string
}

export type UpdateOrganizationInput = {
  color: string
  id: string
  name: string
  slug: string
}

export type ViewOrganizationSettingsFailure =
  | { type: 'accessDenied' }
  | { type: 'organizationNotFound' }
  | { type: 'temporarilyUnavailable' }

export type UpdateOrganizationFailure =
  | ViewOrganizationSettingsFailure
  | { message: string; type: 'invalidInput' }

export type OrganizationSettingsPageDeps = {
  updateOrganization: (
    input: UpdateOrganizationInput,
  ) => Promise<Result<void, UpdateOrganizationFailure>>
  view: (input: {
    signal?: AbortSignal
  }) => Promise<
    Result<OrganizationSettingsPageData, ViewOrganizationSettingsFailure>
  >
}
