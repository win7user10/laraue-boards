import type { ViewBoardPage } from '../../../app/sections/boards/board/actions/viewBoardPage'
import { createApiClient } from '../../api/client'
import {
  mapRawIssueFilters,
  updatedAtDescending,
} from '../../issues/shared/issueAttributes'
import { mapViewBoardPage } from './mapViewBoardPage'

export const openApiViewBoardPage = (baseUrl: string): ViewBoardPage => {
  const client = createApiClient(baseUrl)

  return async ({ attributeQuery, boardId, search }) => {
    try {
      const attributesResponse = await client.GET(
        '/api/organizations/attributes',
      )
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
      const attributeData = mapRawIssueFilters(
        attributeQuery,
        attributesResponse.data,
      )
      const [epicResponse, issuesResponse] = await Promise.all([
        client.GET('/api/epics/{id}', {
          params: { path: { id: boardId } },
        }),
        client.POST('/api/issues/board', {
          body: {
            epicId: boardId,
            filters: attributeData.filters,
            searchString: search || undefined,
            sorting: updatedAtDescending,
            take: 25,
          },
        }),
      ])
      switch (epicResponse.response.status) {
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
      switch (issuesResponse.response.status) {
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
      if (!epicResponse.data || !issuesResponse.data) {
        return err('TemporarilyUnavailable')
      }

      return ok(
        mapViewBoardPage(
          boardId,
          epicResponse.data,
          issuesResponse.data,
          attributeData.attributes,
        ),
      )
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
}
