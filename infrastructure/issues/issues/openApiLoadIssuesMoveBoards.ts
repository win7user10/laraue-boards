import type { LoadIssuesMoveBoards } from '../../../app/sections/issues/issues/actions/loadIssuesMoveBoards'
import { createApiClient } from '../../api/client'
import { mapMoveOptions } from '../../shared/mapMoveOptions'

export const openApiLoadIssuesMoveBoards = (
  baseUrl: string,
): LoadIssuesMoveBoards => {
  const client = createApiClient(baseUrl)
  return async ({ spaceId }) => {
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
      return ok({ boards: mapMoveOptions(response.data) })
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
}
