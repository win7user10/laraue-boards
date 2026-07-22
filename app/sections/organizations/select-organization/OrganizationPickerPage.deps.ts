import type { Result } from '~/utils/actionResult'

export type OrganizationPickerItem = {
  color: string
  description: string
  id: string
  initial: string
  key: string
  name: string
}

export type ViewOrganizationPickerFailure =
  | { type: 'accessDenied' }
  | { type: 'temporarilyUnavailable' }

export type SelectOrganizationFailure =
  | { type: 'accessDenied' }
  | { type: 'organizationNotFound' }
  | { type: 'temporarilyUnavailable' }

export type OrganizationPickerPageDeps = {
  select: (input: {
    organizationId: string
  }) => Promise<Result<null, SelectOrganizationFailure>>
  view: (input: {
    signal?: AbortSignal
  }) => Promise<Result<OrganizationPickerItem[], ViewOrganizationPickerFailure>>
}
