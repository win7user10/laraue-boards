import type { LoadBacklogMoveBoards } from '../../../app/sections/spaces/backlog/actions/loadBacklogMoveBoards'
import { createApiClient } from '../../api/client'
import { mapBacklogMoveBoards } from './mapBacklogMoveBoards'

export const openApiLoadBacklogMoveBoards = (
  baseUrl: string,
): LoadBacklogMoveBoards => {
  const client = createApiClient(baseUrl)
  return async ({ sourceBoardId, spaceId }) => {
    try {
      const response = await client.GET('/api/spaces/{id}/epics', {
        params: { path: { id: Number(spaceId) } },
      })
      switch (response.response.status) {
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
      if (!response.data) {
        return err('TemporarilyUnavailable')
      }
      return ok({
        boards: mapBacklogMoveBoards(response.data, sourceBoardId),
      })
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
}
