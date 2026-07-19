import type { SearchIssues } from '../../../app/sections/issues/issues/actions/searchIssues'
import { createApiClient } from '../../api/client'
import { createdAtDescending, mapIssueFilters } from '../shared/issueAttributes'
import { mapIssuesPageIssue } from './mapIssuesPageIssue'

export const openApiSearchIssues =
  (baseUrl: string): SearchIssues =>
  async (input) => {
    const client = createApiClient(baseUrl)
    try {
      const response = await client.POST('/api/issues/search', {
        body: {
          filters: mapIssueFilters(input.filters),
          page: input.page - 1,
          perPage: 10,
          searchString: input.search || undefined,
          sorting: createdAtDescending,
          spaceIds: input.spaceIds.length ? input.spaceIds : undefined,
        },
      })
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
        IssuesPage: {
          hasNextPage: response.data.hasNextPage,
          issues: response.data.data.map(mapIssuesPageIssue),
        },
      })
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
