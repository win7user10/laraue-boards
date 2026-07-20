import { createApiClient } from '#infrastructure/api/client'
import { findSpaceByKey } from '#infrastructure/spaces/shared/findSpaceByKey'
import { mapViewSpacePage } from '#infrastructure/spaces/space/mapViewSpacePage'
import type { ViewSpacePage } from '~/sections/spaces/space/deps/viewSpacePage'

export const openApiViewSpacePage =
  (baseUrl: string): ViewSpacePage =>
  async ({ spaceKey }) => {
    const client = createApiClient(baseUrl)
    try {
      const spaces = await client.GET('/api/spaces')
      switch (spaces.response.status) {
        case 200:
          break
        case 401:
        case 403:
          return err('AccessDenied')
        default:
          return err('TemporarilyUnavailable')
      }
      const space = spaces.data && findSpaceByKey(spaces.data, spaceKey)
      if (!space) {
        return err('SpaceNotFound')
      }
      const spaceId = String(space.id)
      const [details, summaries] = await Promise.all([
        client.GET('/api/spaces/{id}', {
          params: { path: { id: Number(spaceId) } },
        }),
        client.GET('/api/issues/summary', {
          params: { query: { SpaceId: Number(spaceId) } },
        }),
      ])
      switch (details.response.status) {
        case 200:
          break
        case 401:
        case 403:
          return err('AccessDenied')
        case 404:
          return err('SpaceNotFound')
        default:
          return err('TemporarilyUnavailable')
      }
      switch (summaries.response.status) {
        case 200:
          break
        case 401:
        case 403:
          return err('AccessDenied')
        case 404:
          return err('SpaceNotFound')
        default:
          return err('TemporarilyUnavailable')
      }
      if (!details.data || !summaries.data) {
        return err('TemporarilyUnavailable')
      }

      return ok(mapViewSpacePage(spaceId, space, details.data, summaries.data))
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
