import type { LoadCreateBoardIssueAssignees } from '../../../app/sections/boards/create-issue/actions/loadCreateBoardIssueAssignees'
import { createApiClient } from '../../api/client'
import { mapOrganizationAssignees } from '../../issues/shared/mapOrganizationAssignees'
import { findSpaceByKey } from '../../spaces/shared/findSpaceByKey'

export const openApiLoadCreateBoardIssueAssignees = (
  baseUrl: string,
): LoadCreateBoardIssueAssignees => {
  const client = createApiClient(baseUrl)
  return async ({ spaceKey }) => {
    try {
      const spaces = await client.GET('/api/spaces')
      switch (spaces.response.status) {
        case 200:
          break
        case 401:
        case 403:
          return err('AccessDenied')
        default:
          return err('TemporarilyUnavailable')
      }
      const space = spaces.data && findSpaceByKey(spaces.data, spaceKey)
      if (!space) {
        return err('SpaceNotFound')
      }
      const response = await client.GET('/api/spaces/{id}/members', {
        params: { path: { id: Number(space.id) } },
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
