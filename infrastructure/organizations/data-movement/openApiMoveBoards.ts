import type { MoveBoards } from '../../../app/sections/organizations/data-movement/actions/moveBoards'
import { createApiClient } from '../../api/client'

export const openApiMoveBoards = (baseUrl: string): MoveBoards => {
  const client = createApiClient(baseUrl)
  return async ({ boardIds, destinationSpaceId }) => {
    if (!boardIds.length || !destinationSpaceId) {
      return err('InvalidDestination')
    }
    try {
      const responses = await Promise.all(
        boardIds.map((boardId) =>
          client.POST('/api/movement/epic/{id}/to-space/{newSpaceId}', {
            params: {
              path: {
                id: Number(boardId),
                newSpaceId: Number(destinationSpaceId),
              },
            },
          }),
        ),
      )
      for (const response of responses) {
        switch (response.response.status) {
          case 200:
            break
          case 400:
            return err('InvalidDestination')
          case 401:
          case 403:
            return err('AccessDenied')
          case 404:
            return err('ResourceNotFound')
          default:
            return err('TemporarilyUnavailable')
        }
      }
      return ok(null)
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
}
