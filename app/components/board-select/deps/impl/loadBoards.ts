import type { ApiClient } from '#infrastructure/api/client'
import { tryRequest } from '#infrastructure/api/tryRequest'
import { failed, ok } from '~/utils/actionResult'

import type { BoardSelectDeps } from '../loadBoards'

export const createBoardSelectDeps = (client: ApiClient): BoardSelectDeps => ({
  loadBoards: async ({ spaceId }) => {
    const response = await tryRequest(() =>
      client.GET('/api/spaces/{id}/epics', {
        params: { path: { id: Number(spaceId) } },
      }),
    )

    return response && 'data' in response && response.data !== undefined
      ? ok(
          response.data.map((board) => ({
            label: board.name,
            value: String(board.id),
          })),
        )
      : failed()
  },
})
