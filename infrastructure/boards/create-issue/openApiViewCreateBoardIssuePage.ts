import type { ViewCreateBoardIssuePage } from '../../../app/sections/boards/create-issue/actions/viewCreateBoardIssuePage'
import { createApiClient } from '../../api/client'
import { getFirstStatusId } from '../../issues/shared/firstStatusId'
import { mapIssueAttributes } from '../../issues/shared/issueAttributes'

export const openApiViewCreateBoardIssuePage = (
  baseUrl: string,
): ViewCreateBoardIssuePage => {
  const client = createApiClient(baseUrl)
  return async ({ boardId }) => {
    try {
      const [response, attributesResponse] = await Promise.all([
        client.GET('/api/epics/{id}', {
          params: { path: { id: Number(boardId) } },
        }),
        client.GET('/api/organizations/attributes'),
      ])
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
      if (!response.data.canCreateIssues) {
        return err('AccessDenied')
      }
      const statuses = response.data.statuses ?? []
      return ok({
        CreateBoardIssuePage: {
          attributes: mapIssueAttributes(attributesResponse.data),
          boardId,
          boardName: response.data.name,
          statuses: statuses.map((status) => ({
            label: status.name,
            value: String(status.id),
          })),
          statusId: getFirstStatusId(statuses) ?? '',
        },
      })
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
}
