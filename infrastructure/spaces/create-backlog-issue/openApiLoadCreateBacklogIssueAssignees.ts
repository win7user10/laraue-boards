import { createApiClient } from '#infrastructure/api/client'
import { mapOrganizationAssignees } from '#infrastructure/issues/shared/mapOrganizationAssignees'
import type { LoadCreateBacklogIssueAssignees } from '~/sections/spaces/create-backlog-issue/deps/loadCreateBacklogIssueAssignees'

export const openApiLoadCreateBacklogIssueAssignees = (
  baseUrl: string,
): LoadCreateBacklogIssueAssignees => {
  const client = createApiClient(baseUrl)
  return async ({ spaceId }) => {
    try {
      const response = await client.GET('/api/spaces/{id}/members', {
        params: { path: { id: Number(spaceId) } },
      })
      switch (response.response.status) {
        case 200:
          break
        case 401:
        case 403:
          return err('AccessDenied')
        case 404:
          return err('SpaceNotFound')
        default:
          return err('TemporarilyUnavailable')
      }
      return response.data
        ? ok({ assignees: mapOrganizationAssignees(response.data) })
        : err('TemporarilyUnavailable')
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
}
