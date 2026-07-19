import type { ViewIssuesPage } from '../../../app/sections/issues/issues/actions/viewIssuesPage'
import { createApiClient } from '../../api/client'
import {
  createdAtDescending,
  mapRawIssueFilters,
} from '../shared/issueAttributes'
import { mapIssuesPageIssue } from './mapIssuesPageIssue'

export const openApiViewIssuesPage =
  (baseUrl: string): ViewIssuesPage =>
  async (input) => {
    const client = createApiClient(baseUrl)
    try {
      const attributes = await client.GET('/api/organizations/attributes')
      switch (attributes.response.status) {
        case 200:
          break
        case 401:
        case 403:
          return err('AccessDenied')
        default:
          return err('TemporarilyUnavailable')
      }
      if (!attributes.data) {
        return err('TemporarilyUnavailable')
      }
      const attributeData = mapRawIssueFilters(
        input.attributeQuery,
        attributes.data,
      )
      const [issues, spaces] = await Promise.all([
        client.POST('/api/issues/search', {
          body: {
            filters: attributeData.filters,
            page: input.page - 1,
            perPage: 10,
            searchString: input.search || undefined,
            sorting: createdAtDescending,
            spaceIds: input.spaceIds.length ? input.spaceIds : undefined,
          },
        }),
        client.GET('/api/spaces'),
      ])
      switch (issues.response.status) {
        case 200:
          break
        case 401:
        case 403:
          return err('AccessDenied')
        default:
          return err('TemporarilyUnavailable')
      }
      switch (spaces.response.status) {
        case 200:
          break
        case 401:
        case 403:
          return err('AccessDenied')
        default:
          return err('TemporarilyUnavailable')
      }
      if (!issues.data || !spaces.data) {
        return err('TemporarilyUnavailable')
      }
      return ok({
        IssuesPage: {
          attributes: attributeData.attributes,
          hasNextPage: issues.data.hasNextPage,
          issues: issues.data.data.map(mapIssuesPageIssue),
          spaces: spaces.data.flatMap((space) =>
            space.id === undefined
              ? []
              : [{ label: space.name, value: String(space.id) }],
          ),
        },
      })
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
