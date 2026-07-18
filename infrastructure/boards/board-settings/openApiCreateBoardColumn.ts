import type { CreateBoardColumn } from '../../../app/sections/boards/board-settings/actions/createBoardColumn'
import { createApiClient } from '../../api/client'
import { getInvalidInputError } from '../../api/getInvalidInputError'

export const openApiCreateBoardColumn =
  (baseUrl: string): CreateBoardColumn =>
  async (input) => {
    const client = createApiClient(baseUrl)
    try {
      const response = await client.POST('/api/statuses', {
        body: {
          color: input.color,
          epicId: input.boardId,
          name: input.name.trim(),
        },
      })
      switch (response.response.status) {
        case 400:
          return err(getInvalidInputError(response.error))
        case 401:
        case 403:
          return err('AccessDenied')
        case 404:
          return err('BoardNotFound')
        default:
          break
      }
      if (response.data === undefined) {
        return err('TemporarilyUnavailable')
      }
      return ok({ boardColumnId: String(response.data) })
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
