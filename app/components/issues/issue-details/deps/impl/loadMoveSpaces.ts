import type { ApiClient } from '#infrastructure/api/client'
import { tryRequest } from '#infrastructure/api/tryRequest'
import { failed, ok } from '~/utils/actionResult'

import type { LoadMoveSpaces } from '../loadMoveSpaces'

export const createLoadMoveSpaces =
  (client: ApiClient): LoadMoveSpaces =>
  async () => {
    const response = await tryRequest(() => client.GET('/api/spaces'))

    return response && 'data' in response && response.data !== undefined
      ? ok(
          response.data.map((space) => ({
            label: space.name,
            value: String(space.id),
          })),
        )
      : failed()
  }
