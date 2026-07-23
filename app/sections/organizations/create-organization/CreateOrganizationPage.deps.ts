import type { Result } from '~/utils/actionResult'

type CreateOrganizationInput = {
  color: string
  name: string
  slug: string
}

export type CreateOrganizationFailure =
  | { message: string; type: 'invalidInput' }
  | { type: 'accessDenied' }
  | { type: 'temporarilyUnavailable' }

export type CreateOrganizationPageDeps = {
  create: (
    input: CreateOrganizationInput,
  ) => Promise<Result<{ organizationId: string }, CreateOrganizationFailure>>
}
