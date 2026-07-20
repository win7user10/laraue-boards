import { createApiClient } from '#infrastructure/api/client'
import { getInvalidInputError } from '#infrastructure/api/getInvalidInputError'
import type { CreateAttribute } from '~/sections/organizations/attributes/create-attribute/deps/createAttribute'

export const openApiCreateAttribute = (baseUrl: string): CreateAttribute => {
  const client = createApiClient(baseUrl)
  return async (input) => {
    const listValues =
      input.data.type === 'list'
        ? input.data.listValues.map((name) => name.trim())
        : []
    try {
      const response = await client.POST('/api/organizations/attributes', {
        body: {
          color: input.color,
          listValues:
            input.data.type === 'list'
              ? listValues.map((name) => ({ name }))
              : null,
          name: input.name.trim(),
          type: input.data.type === 'list' ? 1 : 0,
        },
      })
      switch (response.response.status) {
        case 200:
          break
        case 400:
          return err(getInvalidInputError(response.error))
        case 401:
        case 403:
          return err('AccessDenied')
        default:
          return err('TemporarilyUnavailable')
      }
      return response.data === undefined
        ? err('TemporarilyUnavailable')
        : ok({ id: String(response.data) })
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
}
