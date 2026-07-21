import { createApiClient } from '#infrastructure/api/client'
import { mapBoardIssues } from '#infrastructure/boards/board/mapViewBoardPage'
import { mapIssueFilters } from '#infrastructure/issues/shared/issueAttributes'
import { createdAtDescending } from '#infrastructure/issues/shared/issueSorting'
import type { SearchBoardIssues } from '~/sections/boards/board/deps/searchBoardIssues'

export const openApiSearchBoardIssues = (
  baseUrl: string,
): SearchBoardIssues => {
  const client = createApiClient(baseUrl)

  return async ({ boardId, filters, search, take }) => {
    try {
      const response = await client.POST('/api/issues/board', {
        body: {
          epicId: boardId,
          filters: mapIssueFilters(filters),
          searchString: search || undefined,
          sorting: createdAtDescending,
          take,
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
