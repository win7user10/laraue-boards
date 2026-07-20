import { createApiClient } from '#infrastructure/api/client'
import type { LoadMoveStatuses } from '~/components/issues/issue-list/deps/loadMoveStatuses'

export const openApiLoadMoveStatuses = (baseUrl: string): LoadMoveStatuses => {
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
