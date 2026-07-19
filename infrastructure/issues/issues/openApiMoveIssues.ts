import type { MoveIssues } from '../../../app/sections/issues/issues/actions/moveIssues'
import { createApiClient } from '../../api/client'

export const openApiMoveIssues = (baseUrl: string): MoveIssues => {
  const client = createApiClient(baseUrl)
  return async ({ issueIds, statusId }) => {
    if (!issueIds.length || !statusId) {
      return err('InvalidStatus')
    }
    try {
      const responses = await Promise.all(
        issueIds.map((issueId) =>
          client.POST('/api/movement/issue/{id}/move-to-status/{statusId}', {
            params: {
              path: { id: Number(issueId), statusId: Number(statusId) },
            },
          }),
        ),
      )
      for (const response of responses) {
        switch (response.response.status) {
          case 200:
            break
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
      }
      return ok(null)
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
}
