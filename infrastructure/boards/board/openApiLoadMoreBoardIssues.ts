import type { LoadMoreBoardIssues } from '../../../app/sections/boards/board/actions/loadMoreBoardIssues'
import { createApiClient } from '../../api/client'
import {
  mapIssueFilters,
  updatedAtDescending,
} from '../../issues/shared/issueAttributes'
import { mapIssueListDto } from './mapViewBoardPage'

export const openApiLoadMoreBoardIssues = (
  baseUrl: string,
): LoadMoreBoardIssues => {
  const client = createApiClient(baseUrl)

  return async ({ filters, offset, search, statusId, take }) => {
    try {
      const response = await client.POST(
        '/api/issues/by-status/{statusId}/search',
        {
          body: {
            filters: mapIssueFilters(filters),
            searchString: search || undefined,
            skip: offset,
            sorting: updatedAtDescending,
            take,
          },
          params: { path: { statusId: Number(statusId) } },
        },
      )
      switch (response.response.status) {
        case 200:
          break
        case 401:
        case 403:
          return err('AccessDenied')
        default:
          return err('TemporarilyUnavailable')
      }
      if (!response.data) {
        return err('TemporarilyUnavailable')
      }

      return ok({
        hasNext: response.data.hasNext ?? false,
        issues: response.data.data.map(mapIssueListDto),
      })
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
}
