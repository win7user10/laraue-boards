import { createApiClient } from '#infrastructure/api/client'
import type { LoadCreateIssueBoards } from '~/sections/issues/create-issue/deps/loadCreateIssueBoards'

export const openApiLoadCreateIssueBoards = (
  baseUrl: string,
): LoadCreateIssueBoards => {
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
      const boards = response.data.map((board) => ({
        label: board.name,
        value: String(board.id),
      }))
      return ok({
        boardId: String(
          response.data.find((board) => board.isDefault)?.id ??
            response.data[0]?.id ??
            '',
        ),
        boards,
      })
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
}
