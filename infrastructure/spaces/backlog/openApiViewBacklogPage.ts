import { createApiClient } from '#infrastructure/api/client'
import { mapRawIssueFilters } from '#infrastructure/issues/shared/issueAttributes'
import { createdAtDescending } from '#infrastructure/issues/shared/issueSorting'
import { mapBacklogIssue } from '#infrastructure/spaces/backlog/mapBacklogIssue'
import { findSpaceByKey } from '#infrastructure/spaces/shared/findSpaceByKey'
import type { ViewBacklogPage } from '~/sections/spaces/backlog/deps/viewBacklogPage'

export const openApiViewBacklogPage =
  (baseUrl: string): ViewBacklogPage =>
  async (input) => {
    const client = createApiClient(baseUrl)
    try {
      const [spaces, attributes] = await Promise.all([
        client.GET('/api/spaces'),
        client.GET('/api/organizations/attributes'),
      ])
      switch (spaces.response.status) {
        case 200:
          break
        case 401:
        case 403:
          return err('AccessDenied')
        default:
          return err('TemporarilyUnavailable')
      }
      const space = spaces.data && findSpaceByKey(spaces.data, input.spaceKey)
      if (!space) {
        return err('SpaceNotFound')
      }
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
      const spaceId = String(space.id)
      const boards = await client.GET('/api/spaces/{id}/epics', {
        params: { path: { id: Number(spaceId) } },
      })
      switch (boards.response.status) {
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
      const backlog = boards.data?.find((board) => board.isDefault)
      if (!boards.data || !backlog?.id) {
        return err('TemporarilyUnavailable')
      }

      const issues = await client.POST('/api/issues/search', {
        body: {
          epicIds: [backlog.id],
          filters: attributeData.filters,
          page: input.page - 1,
          perPage: 10,
          searchString: input.search || undefined,
          sorting: createdAtDescending,
        },
      })
      switch (issues.response.status) {
        case 200:
          break
        case 401:
        case 403:
          return err('AccessDenied')
        default:
          return err('TemporarilyUnavailable')
      }
      if (!issues.data) {
        return err('TemporarilyUnavailable')
      }

      return ok({
        BacklogPage: {
          attributes: attributeData.attributes,
          backlogBoardId: String(backlog.id),
          color: space.color,
          hasNextPage: issues.data.hasNextPage,
          issues: issues.data.data.map(mapBacklogIssue),
          spaceId,
          spaceKey: input.spaceKey,
          title: backlog.name,
        },
      })
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
