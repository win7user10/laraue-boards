import { createApiClient } from '#infrastructure/api/client'
import { getInvalidInputError } from '#infrastructure/api/getInvalidInputError'
import type { DeleteBoardColumn } from '~/sections/boards/board-settings/deps/deleteBoardColumn'

export const openApiDeleteBoardColumn =
  (baseUrl: string): DeleteBoardColumn =>
  async ({ boardColumnId }) => {
    const client = createApiClient(baseUrl)
    try {
      const response = await client.DELETE('/api/statuses/{id}', {
        params: { path: { id: Number(boardColumnId) } },
      })
      switch (response.response.status) {
        case 400:
          return err(getInvalidInputError(response.error))
        case 401:
        case 403:
          return err('AccessDenied')
        case 404:
          return err('BoardColumnNotFound')
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
