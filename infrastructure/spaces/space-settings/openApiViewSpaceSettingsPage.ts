import type { ViewSpaceSettingsPage } from '../../../app/sections/spaces/space-settings/actions/viewSpaceSettingsPage'
import { createApiClient } from '../../api/client'
import { findSpaceByKey } from '../shared/findSpaceByKey'

export const openApiViewSpaceSettingsPage =
  (baseUrl: string): ViewSpaceSettingsPage =>
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
      const details = await client.GET('/api/spaces/{id}', {
        params: { path: { id: Number(spaceId) } },
      })
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
      if (!details.data) {
        return err('TemporarilyUnavailable')
      }
      return ok({
        SpaceSettingsPage: {
          canDelete: details.data.canDelete,
          canUpdate: details.data.canUpdate,
          color: space.color,
          id: spaceId,
          name: space.name,
          spaceKey,
        },
      })
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
