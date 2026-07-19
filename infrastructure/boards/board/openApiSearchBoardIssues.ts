import type { SearchBoardIssues } from '../../../app/sections/boards/board/actions/searchBoardIssues'
import { createApiClient } from '../../api/client'
import {
  mapIssueFilters,
  updatedAtDescending,
} from '../../issues/shared/issueAttributes'
import { mapBoardIssues } from './mapViewBoardPage'

export const openApiSearchBoardIssues = (
  baseUrl: string,
): SearchBoardIssues => {
  const client = createApiClient(baseUrl)

  return async ({ boardId, filters, search }) => {
    try {
      const response = await client.POST('/api/issues/board', {
        body: {
          epicId: boardId,
          filters: mapIssueFilters(filters),
          searchString: search || undefined,
          sorting: updatedAtDescending,
          take: 25,
        },
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
      return response.data
        ? ok(mapBoardIssues(response.data))
        : err('TemporarilyUnavailable')
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
}
