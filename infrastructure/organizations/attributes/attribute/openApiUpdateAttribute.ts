import type { UpdateAttribute } from '../../../../app/sections/organizations/attributes/attribute/actions/updateAttribute'
import { createApiClient } from '../../../api/client'
import { getInvalidInputError } from '../../../api/getInvalidInputError'

export const openApiUpdateAttribute = (baseUrl: string): UpdateAttribute => {
  const client = createApiClient(baseUrl)
  return async (input) => {
    const listValues =
      input.data.type === 'list'
        ? input.data.listValues.map((option) => ({
            id: option.id,
            name: option.name.trim(),
          }))
        : null
    try {
      const response = await client.PUT('/api/organizations/attributes/{id}', {
        body: {
          color: input.color,
          id: Number(input.id),
          listValues,
          name: input.name.trim(),
        },
        params: { path: { id: Number(input.id) } },
      })
      switch (response.response.status) {
        case 200:
          return ok(null)
        case 400:
          return err(getInvalidInputError(response.error))
        case 401:
        case 403:
          return err('AccessDenied')
        case 404:
          return err('AttributeNotFound')
        default:
          return err('TemporarilyUnavailable')
      }
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
}
