import type { LoadBacklogMoveStatuses } from '../../../app/sections/spaces/backlog/actions/loadBacklogMoveStatuses'
import { createApiClient } from '../../api/client'

export const openApiLoadBacklogMoveStatuses = (
  baseUrl: string,
): LoadBacklogMoveStatuses => {
  const client = createApiClient(baseUrl)
  return async ({ boardId }) => {
    try {
      const response = await client.GET('/api/epics/{id}', {
        params: { path: { id: Number(boardId) } },
      })
      switch (response.response.status) {
        case 200:
          break
        case 401:
        case 403:
          return err('AccessDenied')
        case 404:
          return err('BoardNotFound')
        default:
          return err('TemporarilyUnavailable')
      }
      if (!response.data) {
        return err('TemporarilyUnavailable')
      }
      return ok({
        statuses: (response.data.statuses ?? [])
          .toSorted((a, b) => Number(a.sortOrder) - Number(b.sortOrder))
          .map((status) => ({ id: String(status.id), name: status.name })),
      })
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
}
