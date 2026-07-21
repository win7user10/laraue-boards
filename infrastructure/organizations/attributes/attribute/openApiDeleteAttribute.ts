import { createApiClient } from '#infrastructure/api/client'
import type { DeleteAttribute } from '~/sections/organizations/attributes/attribute/deps/deleteAttribute'

export const openApiDeleteAttribute = (baseUrl: string): DeleteAttribute => {
  const client = createApiClient(baseUrl)
  return async ({ id }) => {
    try {
      const response = await client.DELETE(
        '/api/organizations/attributes/{id}',
        { params: { path: { id: Number(id) } } },
      )
      switch (response.response.status) {
        case 200:
          return ok(null)
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
