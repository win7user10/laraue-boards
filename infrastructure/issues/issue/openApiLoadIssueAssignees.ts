import type { LoadIssueAssignees } from '../../../app/sections/issues/issue/actions/loadIssueAssignees'
import { createApiClient } from '../../api/client'
import { mapOrganizationAssignees } from '../shared/mapOrganizationAssignees'

export const openApiLoadIssueAssignees = (
  baseUrl: string,
): LoadIssueAssignees => {
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
