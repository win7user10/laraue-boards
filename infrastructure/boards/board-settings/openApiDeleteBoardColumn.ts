import type { DeleteBoardColumn } from '../../../app/sections/boards/board-settings/actions/deleteBoardColumn'
import { createApiClient } from '../../api/client'
import { getInvalidInputError } from '../../api/getInvalidInputError'

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
