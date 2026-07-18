import type { ViewCreateIssuePage } from '../../../app/sections/issues/create-issue/actions/viewCreateIssuePage'
import { createApiClient } from '../../api/client'
import { mapIssueAttributes } from '../shared/issueAttributes'

export const openApiViewCreateIssuePage = (
  baseUrl: string,
): ViewCreateIssuePage => {
  const client = createApiClient(baseUrl)
  return async () => {
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
      if (!spacesResponse.data) {
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
      const spaces = spacesResponse.data.flatMap((space) =>
        space.id === undefined
          ? []
          : [{ label: space.name, value: String(space.id) }],
      )
      const selectedSpace = spaces[0]
      return ok({
        CreateIssuePage: {
          attributes: mapIssueAttributes(attributesResponse.data),
          boardId: '',
          boards: [],
          spaceId: selectedSpace?.value ?? '',
          spaces,
          statuses: [],
          statusId: '',
        },
      })
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
}
