import type { LoadIssueStatuses } from '../../../app/sections/issues/issue/actions/loadIssueStatuses'
import { createApiClient } from '../../api/client'
import { mapIssueStatuses } from './mapIssueStatuses'

export const openApiLoadIssueStatuses =
  (baseUrl: string): LoadIssueStatuses =>
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
