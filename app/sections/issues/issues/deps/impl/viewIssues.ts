import type { ApiClient } from '#infrastructure/api/client'
import { tryRequest } from '#infrastructure/api/tryRequest'
import { mapRawIssueFilters } from '~/sections/issues/shared/api/issueAttributes'
import { createdAtDescending } from '~/sections/issues/shared/api/issueSorting'
import { err, ok } from '~/utils/actionResult'

import type { ViewIssues, ViewIssuesFailure } from '../viewIssues'
import { mapIssue } from './mapIssue'

const getFailure = (responses: Array<{ response: Response }>): ViewIssuesFailure =>
  responses.some(({ response }) => response.status === 401 || response.status === 403)
    ? { type: 'accessDenied' }
    : { type: 'temporarilyUnavailable' }

export const createViewIssues =
  (client: ApiClient): ViewIssues =>
  async ({ attributeQuery, page, search, signal, spaceIds }) => {
    const attributes = await tryRequest(() =>
      client.GET('/api/organizations/attributes', { signal }),
    )
    if (!attributes) {
      return err({ type: 'temporarilyUnavailable' })
    }
    if ('error' in attributes || attributes.data === undefined) {
      return err(getFailure([attributes]))
    }

    const attributeData = mapRawIssueFilters(attributeQuery, attributes.data)
    const responses = await tryRequest(() =>
      Promise.all([
        client.POST('/api/issues/search', {
          body: {
            filters: attributeData.filters,
            page: page - 1,
            perPage: 10,
            searchString: search || undefined,
            sorting: createdAtDescending,
            spaceIds: spaceIds.length ? spaceIds : undefined,
          },
          signal,
        }),
        client.GET('/api/spaces', { signal }),
      ]),
    )
    if (!responses) {
      return err({ type: 'temporarilyUnavailable' })
    }

    const [issues, spaces] = responses
    if ('error' in issues || 'error' in spaces) {
      return err(getFailure([issues, spaces]))
    }
    if (issues.data === undefined || spaces.data === undefined) {
      return err({ type: 'temporarilyUnavailable' })
    }

    return ok({
      attributes: attributeData.attributes,
      hasNextPage: issues.data.hasNextPage,
      issues: issues.data.data.map(mapIssue),
      spaces: spaces.data.flatMap((space) =>
        space.id === undefined ? [] : [{ label: space.name, value: String(space.id) }],
      ),
    })
  }
