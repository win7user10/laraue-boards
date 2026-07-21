import { createApiClient } from '#infrastructure/api/client'
import type { LoadCreateIssueStatuses } from '~/sections/issues/create-issue/deps/loadCreateIssueStatuses'

export const openApiLoadCreateIssueStatuses = (
  baseUrl: string,
): LoadCreateIssueStatuses => {
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
      if (!response.data.canCreateIssues) {
        return err('AccessDenied')
      }
      return ok({
        statuses: (response.data.statuses ?? [])
          .toSorted(
            (left, right) => Number(left.sortOrder) - Number(right.sortOrder),
          )
          .map((status) => ({
            label: status.name,
            value: String(status.id),
          })),
      })
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
}
