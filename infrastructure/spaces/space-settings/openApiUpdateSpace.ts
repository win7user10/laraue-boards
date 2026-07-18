import type { UpdateSpace } from '../../../app/sections/spaces/space-settings/actions/updateSpace'
import { createApiClient } from '../../api/client'
import { getInvalidInputError } from '../../api/getInvalidInputError'

export const openApiUpdateSpace =
  (baseUrl: string): UpdateSpace =>
  async (input) => {
    const client = createApiClient(baseUrl)
    try {
      const response = await client.PUT('/api/spaces/{id}', {
        body: {
          color: input.color,
          id: input.spaceId,
          key: input.key,
          name: input.name,
        },
        params: { path: { id: Number(input.spaceId) } },
      })
      switch (response.response.status) {
        case 400:
          return err(getInvalidInputError(response.error))
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
