import { createApiClient } from '#infrastructure/api/client'
import { mapIssueFilters } from '#infrastructure/issues/shared/issueAttributes'
import { createdAtDescending } from '#infrastructure/issues/shared/issueSorting'
import { mapBacklogIssue } from '#infrastructure/spaces/backlog/mapBacklogIssue'
import type { SearchBacklogIssues } from '~/sections/spaces/backlog/deps/searchBacklogIssues'

export const openApiSearchBacklogIssues =
  (baseUrl: string): SearchBacklogIssues =>
  async (input) => {
    const client = createApiClient(baseUrl)
    try {
      const response = await client.POST('/api/issues/search', {
        body: {
          epicIds: [input.backlogBoardId],
          filters: mapIssueFilters(input.filters),
          page: input.page - 1,
          perPage: 10,
          searchString: input.search || undefined,
          sorting: createdAtDescending,
        },
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
      if (!response.data) {
        return err('TemporarilyUnavailable')
      }
      return ok({
        BacklogPage: {
          hasNextPage: response.data.hasNextPage,
          issues: response.data.data.map(mapBacklogIssue),
        },
      })
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
