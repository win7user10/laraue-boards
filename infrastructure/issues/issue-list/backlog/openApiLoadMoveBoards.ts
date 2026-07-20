import { createApiClient } from '#infrastructure/api/client'
import { mapBacklogMoveBoards } from '#infrastructure/issues/issue-list/backlog/mapBacklogMoveBoards'
import type { LoadMoveBoards } from '~/components/issues/issue-list/deps/loadMoveBoards'

export const openApiLoadMoveBoards = (baseUrl: string): LoadMoveBoards => {
  const client = createApiClient(baseUrl)
  return async ({ sourceBoardId, spaceId }) => {
    if (sourceBoardId === null) {
      return err('SpaceNotFound')
    }
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
