import type { LoadIssueStatuses } from '../../../app/sections/boards/board/actions/loadIssueStatuses'
import { createApiClient } from '../../api/client'

export const openApiLoadIssueStatuses =
  (baseUrl: string): LoadIssueStatuses =>
  async ({ boardId }) => {
    const client = createApiClient(baseUrl)
    try {
      const response = await client.GET('/api/epics/{id}', {
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
      return response.data
        ? ok({
            statuses: (response.data.statuses ?? []).map((status) => ({
              id: String(status.id),
              name: status.name,
            })),
          })
        : err('TemporarilyUnavailable')
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
