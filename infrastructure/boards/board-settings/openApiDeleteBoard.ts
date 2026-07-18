import type { DeleteBoard } from '../../../app/sections/boards/board-settings/actions/deleteBoard'
import { createApiClient } from '../../api/client'

export const openApiDeleteBoard =
  (baseUrl: string): DeleteBoard =>
  async ({ boardId }) => {
    const client = createApiClient(baseUrl)
    try {
      const response = await client.DELETE('/api/epics/{id}', {
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
