import type { ViewCreateBacklogIssuePage } from '../../../app/sections/spaces/create-backlog-issue/actions/viewCreateBacklogIssuePage'
import { createApiClient } from '../../api/client'
import { getFirstStatusId } from '../../issues/shared/firstStatusId'
import { mapIssueAttributes } from '../../issues/shared/issueAttributes'
import { findSpaceByKey } from '../shared/findSpaceByKey'

export const openApiViewCreateBacklogIssuePage = (
  baseUrl: string,
): ViewCreateBacklogIssuePage => {
  const client = createApiClient(baseUrl)
  return async ({ spaceKey }) => {
    try {
      const [spacesResponse, attributesResponse] = await Promise.all([
        client.GET('/api/spaces'),
        client.GET('/api/organizations/attributes'),
      ])
      switch (spacesResponse.response.status) {
        case 200:
          break
        case 401:
        case 403:
          return err('AccessDenied')
        default:
          return err('TemporarilyUnavailable')
      }
      const space =
        spacesResponse.data && findSpaceByKey(spacesResponse.data, spaceKey)
      if (!space) {
        return err('SpaceNotFound')
      }
      switch (attributesResponse.response.status) {
        case 200:
          break
        case 401:
        case 403:
          return err('AccessDenied')
        default:
          return err('TemporarilyUnavailable')
      }
      if (!attributesResponse.data) {
        return err('TemporarilyUnavailable')
      }
      const boardsResponse = await client.GET('/api/spaces/{id}/epics', {
        params: { path: { id: Number(space.id) } },
      })
      switch (boardsResponse.response.status) {
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
      if (!boardsResponse.data) {
        return err('TemporarilyUnavailable')
      }
      const backlog = boardsResponse.data.find((board) => board.isDefault)
      if (!backlog) {
        return err('BacklogNotFound')
      }

      const boardResponse = await client.GET('/api/epics/{id}', {
        params: { path: { id: Number(backlog.id) } },
      })
      switch (boardResponse.response.status) {
        case 200:
          break
        case 401:
        case 403:
          return err('AccessDenied')
        case 404:
          return err('BacklogNotFound')
        default:
          return err('TemporarilyUnavailable')
      }
      if (!boardResponse.data) {
        return err('TemporarilyUnavailable')
      }
      if (!boardResponse.data.canCreateIssues) {
        return err('AccessDenied')
      }
      const statuses = boardResponse.data.statuses ?? []
      return ok({
        CreateBacklogIssuePage: {
          attributes: mapIssueAttributes(attributesResponse.data),
          boardName: backlog.name,
          spaceId: String(space.id),
          spaceKey,
          statusId: getFirstStatusId(statuses) ?? '',
        },
      })
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
}
