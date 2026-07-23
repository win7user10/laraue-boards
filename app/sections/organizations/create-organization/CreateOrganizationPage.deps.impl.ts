import type { ApiClient } from '#infrastructure/api/client'
import { getInvalidInputError } from '#infrastructure/api/getInvalidInputError'
import type {
  CreateOrganizationFailure,
  CreateOrganizationPageDeps,
} from '~/sections/organizations/create-organization/CreateOrganizationPage.deps'
import { err, ok } from '~/utils/actionResult'

const mapFailure = (
  status: number,
  error: unknown,
): CreateOrganizationFailure | undefined => {
  if (status === 400) {
    return {
      message: getInvalidInputError(error).message,
      type: 'invalidInput',
    }
  }
  if (status === 401 || status === 403) {
    return { type: 'accessDenied' }
  }
  if (status >= 500) {
    return { type: 'temporarilyUnavailable' }
  }
}

export function createCreateOrganizationPageDeps(
  client: ApiClient,
): CreateOrganizationPageDeps {
  return {
    async create(input) {
      const response = await client.POST('/api/organizations', { body: input })
      if ('error' in response) {
        const failure = mapFailure(response.response.status, response.error)
        if (failure) {
          return err(failure)
        }
        throw new Error(
          `Unrecognized create organization response: ${response.response.status}`,
        )
      }
      if (response.data.id === undefined) {
        throw new Error('Create organization response has no id')
      }
      return ok({ organizationId: String(response.data.id) })
    },
  }
}
