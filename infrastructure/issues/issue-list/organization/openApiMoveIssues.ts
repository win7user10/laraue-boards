import { createApiClient } from '#infrastructure/api/client'
import type { MoveIssues } from '~/components/issues/issue-list/deps/moveIssues'

export const openApiMoveIssues = (baseUrl: string): MoveIssues => {
  const client = createApiClient(baseUrl)
  return async ({ issueKeys, statusId }) => {
    if (!issueKeys.length || !statusId) {
      return err('InvalidStatus')
    }
    try {
      const responses = await Promise.all(
        issueKeys.map((issueKey) =>
          client.POST('/api/movement/issue/{key}/move-to-status/{statusId}', {
            params: {
              path: { key: issueKey, statusId: Number(statusId) },
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
