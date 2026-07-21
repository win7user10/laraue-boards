import { createApiClient } from '#infrastructure/api/client'
import { mapIssueStatuses } from '#infrastructure/issues/issue-details/mapIssueStatuses'
import type { LoadStatuses } from '~/components/issues/issue-details/deps/loadStatuses'

export const openApiLoadStatuses =
  (baseUrl: string): LoadStatuses =>
  async ({ boardId }) => {
    const client = createApiClient(baseUrl)
    try {
      const board = await client.GET('/api/epics/{id}', {
        params: { path: { id: Number(boardId) } },
      })
      switch (board.response.status) {
        case 401:
        case 403:
          return err('AccessDenied')
        case 404:
          return err('BoardNotFound')
        default:
          break
      }
      if (!board.data) {
        return err('TemporarilyUnavailable')
      }
      return ok({
        statuses: mapIssueStatuses(board.data.statuses ?? []),
      })
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
