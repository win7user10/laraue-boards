import { createApiClient } from '#infrastructure/api/client'
import { getFirstStatusId } from '#infrastructure/issues/shared/firstStatusId'
import { findSpaceByKey } from '#infrastructure/spaces/shared/findSpaceByKey'
import type { MoveIssueToBacklog } from '~/sections/boards/board/deps/moveIssueToBacklog'

export const openApiMoveIssueToBacklog = (
  baseUrl: string,
): MoveIssueToBacklog => {
  const client = createApiClient(baseUrl)
  return async ({ boardId, issueKey, spaceKey }) => {
    try {
      const spaces = await client.GET('/api/spaces')
      switch (spaces.response.status) {
        case 200:
          break
        case 401:
        case 403:
          return err('AccessDenied')
        default:
          return err('TemporarilyUnavailable')
      }
      const space = spaces.data && findSpaceByKey(spaces.data, spaceKey)
      if (!space) {
        return err('ResourceNotFound')
      }
      const epics = await client.GET('/api/spaces/{id}/epics', {
        params: { path: { id: Number(space.id) } },
      })
      switch (epics.response.status) {
        case 200:
          break
        case 401:
        case 403:
          return err('AccessDenied')
        case 404:
          return err('ResourceNotFound')
        default:
          return err('TemporarilyUnavailable')
      }
      if (!epics.data) {
        return err('TemporarilyUnavailable')
      }
      if (!epics.data.some((epic) => String(epic.id) === boardId)) {
        return err('ResourceNotFound')
      }
      const backlog = epics.data.find((epic) => epic.isDefault)
      if (!backlog) {
        return err('ResourceNotFound')
      }
      if (String(backlog.id) === boardId) {
        return err('AlreadyInBacklog')
      }

      const backlogBoard = await client.GET('/api/epics/{id}', {
        params: { path: { id: Number(backlog.id) } },
      })
      switch (backlogBoard.response.status) {
        case 200:
          break
        case 401:
        case 403:
          return err('AccessDenied')
        case 404:
          return err('ResourceNotFound')
        default:
          return err('TemporarilyUnavailable')
      }
      if (!backlogBoard.data) {
        return err('TemporarilyUnavailable')
      }
      const statusId = getFirstStatusId(backlogBoard.data.statuses ?? [])
      if (!statusId) {
        return err('TemporarilyUnavailable')
      }

      const response = await client.POST(
        '/api/movement/issue/{key}/move-to-status/{statusId}',
        {
          params: {
            path: { key: issueKey, statusId: Number(statusId) },
          },
        },
      )
      switch (response.response.status) {
        case 200:
          return ok(null)
        case 401:
        case 403:
          return err('AccessDenied')
        case 404:
          return err('ResourceNotFound')
        default:
          return err('TemporarilyUnavailable')
      }
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
}
