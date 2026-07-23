import type { ApiClient } from '#infrastructure/api/client'
import { tryRequest } from '#infrastructure/api/tryRequest'
import { failed, ok } from '~/utils/actionResult'

import type { LoadStatuses } from '../loadStatuses'

export const createLoadStatuses =
  (client: ApiClient): LoadStatuses =>
  async ({ boardId }) => {
    const response = await tryRequest(() =>
      client.GET('/api/epics/{id}', {
        params: { path: { id: Number(boardId) } },
      }),
    )

    return response && 'data' in response && response.data !== undefined
      ? ok(
          (response.data.statuses ?? [])
            .toSorted((a, b) => Number(a.sortOrder) - Number(b.sortOrder))
            .map((status) => ({ id: String(status.id), name: status.name })),
        )
      : failed()
  }
