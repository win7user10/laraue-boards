import type { ApiClient } from '#infrastructure/api/client'
import { tryRequest } from '#infrastructure/api/tryRequest'
import { mapIssueFilters } from '~/sections/issues/shared/api/issueAttributes'
import { createdAtDescending } from '~/sections/issues/shared/api/issueSorting'
import { failed, ok } from '~/utils/actionResult'

import type { SearchIssues } from '../searchIssues'
import { mapIssue } from './mapIssue'

export const createSearchIssues =
  (client: ApiClient): SearchIssues =>
  async ({ filters, page, search, spaceIds }) => {
    const mappedFilters = mapIssueFilters(filters)
    const response = await tryRequest(() =>
      client.POST('/api/issues/search', {
        body: {
          filters: mappedFilters,
          page: page - 1,
          perPage: 10,
          searchString: search || undefined,
          sorting: createdAtDescending,
          spaceIds: spaceIds.length ? spaceIds : undefined,
        },
      }),
    )

    return response && 'data' in response && response.data !== undefined
      ? ok({
          hasNextPage: response.data.hasNextPage,
          issues: response.data.data.map(mapIssue),
        })
      : failed()
  }
