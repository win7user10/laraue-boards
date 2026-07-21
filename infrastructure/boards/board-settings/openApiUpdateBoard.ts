import { createApiClient } from '#infrastructure/api/client'
import { getInvalidInputError } from '#infrastructure/api/getInvalidInputError'
import type { UpdateBoard } from '~/sections/boards/board-settings/deps/updateBoard'

export const openApiUpdateBoard =
  (baseUrl: string): UpdateBoard =>
  async (input) => {
    const client = createApiClient(baseUrl)
    try {
      const response = await client.PUT('/api/epics/{id}', {
        body: { color: input.color, id: input.boardId, name: input.name },
        params: { path: { id: Number(input.boardId) } },
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
      if (!response.response.ok) {
        return err('TemporarilyUnavailable')
      }
      return ok(null)
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
