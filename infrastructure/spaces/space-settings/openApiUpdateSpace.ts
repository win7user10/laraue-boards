import { createApiClient } from '#infrastructure/api/client'
import { getInvalidInputError } from '#infrastructure/api/getInvalidInputError'
import type { UpdateSpace } from '~/sections/spaces/space-settings/deps/updateSpace'

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
