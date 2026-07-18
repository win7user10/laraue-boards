import type { LoadBacklogMoveSpaces } from '../../../app/sections/spaces/backlog/actions/loadBacklogMoveSpaces'
import { createApiClient } from '../../api/client'
import { mapMoveOptions } from '../../shared/mapMoveOptions'

export const openApiLoadBacklogMoveSpaces = (
  baseUrl: string,
): LoadBacklogMoveSpaces => {
  const client = createApiClient(baseUrl)
  return async () => {
    try {
      const response = await client.GET('/api/spaces')
      switch (response.response.status) {
        case 200:
          break
        case 401:
        case 403:
          return err('AccessDenied')
        default:
          return err('TemporarilyUnavailable')
      }
      return response.data
        ? ok({ spaces: mapMoveOptions(response.data) })
        : err('TemporarilyUnavailable')
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
}
