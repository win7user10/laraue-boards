import type { MoveIssue } from '../../../app/sections/issues/issue/actions/moveIssue'
import { createApiClient } from '../../api/client'

export const openApiMoveIssue =
  (baseUrl: string): MoveIssue =>
  async (input) => {
    if (!input.statusId) {
      return err('InvalidStatus')
    }
    const client = createApiClient(baseUrl)
    try {
      const response = await client.POST(
        '/api/movement/issue/{id}/move-to-status/{statusId}',
        {
          params: {
            path: {
              id: Number(input.issueId),
              statusId: Number(input.statusId),
            },
          },
        },
      )
      switch (response.response.status) {
        case 400:
          return err('InvalidStatus')
        case 401:
        case 403:
          return err('AccessDenied')
        case 404:
          return err('ResourceNotFound')
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
