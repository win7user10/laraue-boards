import type { UpdateBoardColumn } from '../../../app/sections/boards/board-settings/actions/updateBoardColumn'
import { createApiClient } from '../../api/client'
import { getInvalidInputError } from '../../api/getInvalidInputError'

export const openApiUpdateBoardColumn =
  (baseUrl: string): UpdateBoardColumn =>
  async (input) => {
    const client = createApiClient(baseUrl)
    try {
      const response = await client.PUT('/api/statuses/{id}', {
        body: {
          color: input.color,
          id: input.boardColumnId,
          name: input.name,
        },
        params: { path: { id: Number(input.boardColumnId) } },
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
