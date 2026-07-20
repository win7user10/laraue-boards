import { createApiClient } from '#infrastructure/api/client'
import type { ReorderBoardColumns } from '~/sections/boards/board-settings/deps/reorderBoardColumns'

export const getBoardColumnSortOrders = (boardColumnIds: string[]) =>
  Object.fromEntries(boardColumnIds.map((id, index) => [id, index + 1]))

export const openApiReorderBoardColumns =
  (baseUrl: string): ReorderBoardColumns =>
  async ({ boardColumnIds, boardId }) => {
    const client = createApiClient(baseUrl)
    try {
      const response = await client.POST('/api/epics/{id}/reorder-statuses', {
        body: getBoardColumnSortOrders(boardColumnIds),
        params: { path: { id: Number(boardId) } },
      })
      switch (response.response.status) {
        case 401:
        case 403:
          return err('AccessDenied')
        case 404:
          return err('BoardNotFound')
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
