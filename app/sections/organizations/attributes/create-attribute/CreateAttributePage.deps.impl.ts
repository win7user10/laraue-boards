import type { ApiClient } from '#infrastructure/api/client'
import { getInvalidInputError } from '#infrastructure/api/getInvalidInputError'
import type {
  CreateAttributeFailure,
  CreateAttributePageDeps,
} from '~/sections/organizations/attributes/create-attribute/CreateAttributePage.deps'
import { err, ok } from '~/utils/actionResult'

const mapFailure = (
  status: number,
  error: unknown,
): CreateAttributeFailure | undefined => {
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

export function createCreateAttributePageDeps(
  client: ApiClient,
): CreateAttributePageDeps {
  return {
    async create(input) {
      const response = await client.POST('/api/organizations/attributes', {
        body: {
          color: input.color,
          listValues:
            input.data.type === 'list'
              ? input.data.listValues.map((name) => ({ name: name.trim() }))
              : null,
          name: input.name.trim(),
          type: input.data.type === 'list' ? 1 : 0,
        },
      })
      if (!response.response.ok) {
        const failure = mapFailure(response.response.status, response.error)
        if (failure) {
          return err(failure)
        }
        throw new Error(
          `Unrecognized create attribute response: ${response.response.status}`,
        )
      }
      if (response.data === undefined) {
        throw new Error('Create attribute response has no data')
      }
      return ok({ id: String(response.data) })
    },
  }
}
