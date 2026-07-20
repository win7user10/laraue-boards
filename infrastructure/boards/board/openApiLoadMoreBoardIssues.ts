import { createApiClient } from '#infrastructure/api/client'
import { mapIssueListDto } from '#infrastructure/boards/board/mapViewBoardPage'
import { mapIssueFilters } from '#infrastructure/issues/shared/issueAttributes'
import { createdAtDescending } from '#infrastructure/issues/shared/issueSorting'
import type { LoadMoreBoardIssues } from '~/sections/boards/board/deps/loadMoreBoardIssues'

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
            sorting: createdAtDescending,
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
