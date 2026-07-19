import type { DeleteSpace } from '../../../app/sections/spaces/space-settings/actions/deleteSpace'
import { createApiClient } from '../../api/client'

export const openApiDeleteSpace =
  (baseUrl: string): DeleteSpace =>
  async ({ spaceId }) => {
    const client = createApiClient(baseUrl)
    try {
      const response = await client.DELETE('/api/spaces/{id}', {
        params: { path: { id: Number(spaceId) } },
      })
      switch (response.response.status) {
        case 401:
        case 403:
          return err('AccessDenied')
        case 404:
          return err('SpaceNotFound')
        default:
          break
      }
      if (!response.response.ok) {
        return err('TemporarilyUnavailable')
      }
      return ok(null)
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
