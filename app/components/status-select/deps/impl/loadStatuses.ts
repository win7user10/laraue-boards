import type { ApiClient } from '#infrastructure/api/client'
import { tryRequest } from '#infrastructure/api/tryRequest'
import { failed, ok } from '~/utils/actionResult'

import type { StatusSelectDeps } from '../loadStatuses'

export const createStatusSelectDeps = (client: ApiClient): StatusSelectDeps => ({
  loadStatuses: async ({ boardId }) => {
    const response = await tryRequest(() =>
      client.GET('/api/epics/{id}', {
        params: { path: { id: Number(boardId) } },
      }),
    )

    return response && 'data' in response && response.data !== undefined
      ? ok(
          (response.data.statuses ?? [])
            .toSorted((left, right) => Number(left.sortOrder) - Number(right.sortOrder))
            .map((status) => ({
              label: status.name,
              value: String(status.id),
            })),
        )
      : failed()
  },
})
