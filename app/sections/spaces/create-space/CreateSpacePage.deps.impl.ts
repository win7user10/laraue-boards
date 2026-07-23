import type { ApiClient } from '#infrastructure/api/client'
import { getInvalidInputError } from '#infrastructure/api/getInvalidInputError'
import type {
  CreateSpaceFailure,
  CreateSpacePageDeps,
} from '~/sections/spaces/create-space/CreateSpacePage.deps'
import { err, ok } from '~/utils/actionResult'

const mapFailure = (status: number, error: unknown): CreateSpaceFailure | undefined => {
  if (status === 400) {
    return {
      message: getInvalidInputError(error).message,
      type: 'invalidInput',
    }
  }
  if (status === 401 || status === 403) {
    return { type: 'accessDenied' }
  }
  if (status === 404) {
    return { type: 'organizationNotFound' }
  }
  if (status >= 500) {
    return { type: 'temporarilyUnavailable' }
  }
}

export function createCreateSpacePageDeps(client: ApiClient): CreateSpacePageDeps {
  return {
    async create(input) {
      const response = await client.POST('/api/spaces', {
        body: input,
        parseAs: 'text',
      })
      if ('data' in response) {
        return ok({ spaceKey: input.key })
      }
      const failure = mapFailure(response.response.status, response.error)
      if (failure) {
        return err(failure)
      }
      throw new Error(`Unrecognized create space response: ${response.response.status}`)
    },
  }
}
