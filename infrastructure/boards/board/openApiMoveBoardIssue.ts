import type { MoveBoardIssue } from '../../../app/sections/boards/board/actions/moveBoardIssue'
import { createApiClient } from '../../api/client'

export const openApiMoveBoardIssue = (baseUrl: string): MoveBoardIssue => {
  const client = createApiClient(baseUrl)

  return async ({ issueId, statusId }) => {
    if (!statusId) {
      return err('InvalidStatus')
    }

    try {
      const response = await client.POST(
        '/api/movement/issue/{id}/move-to-status/{statusId}',
        {
          params: {
            path: { id: Number(issueId), statusId: Number(statusId) },
          },
        },
      )

      switch (response.response.status) {
        case 200:
          return ok(null)
        case 400:
          return err('InvalidStatus')
        case 401:
        case 403:
          return err('AccessDenied')
        case 404:
          return err('ResourceNotFound')
        default:
          return err('TemporarilyUnavailable')
      }
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
}
