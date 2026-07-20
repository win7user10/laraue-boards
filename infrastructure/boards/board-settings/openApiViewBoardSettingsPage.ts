import { createApiClient } from '#infrastructure/api/client'
import { DEFAULT_COLOR } from '~/constants/colors'
import type { ViewBoardSettingsPage } from '~/sections/boards/board-settings/deps/viewBoardSettingsPage'

export const openApiViewBoardSettingsPage =
  (baseUrl: string): ViewBoardSettingsPage =>
  async ({ boardId }) => {
    const client = createApiClient(baseUrl)
    try {
      const response = await client.GET('/api/epics/{id}', {
        params: { path: { id: Number(boardId) } },
      })
      switch (response.response.status) {
        case 401:
        case 403:
          return err('AccessDenied')
        case 404:
          return err('BoardNotFound')
        default:
          break
      }
      if (!response.data) {
        return err('TemporarilyUnavailable')
      }
      return ok({
        BoardSettingsPage: {
          canDelete: response.data.canDelete ?? false,
          canUpdate: response.data.canUpdate ?? false,
          color: response.data.color ?? DEFAULT_COLOR,
          columns: (response.data.statuses ?? [])
            .toSorted(
              (left, right) => Number(left.sortOrder) - Number(right.sortOrder),
            )
            .map((status) => ({
              color: status.color ?? DEFAULT_COLOR,
              id: String(status.id),
              name: status.name,
            })),
          id: boardId,
          name: response.data.name,
        },
      })
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
