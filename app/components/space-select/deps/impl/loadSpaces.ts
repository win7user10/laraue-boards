import type { ApiClient } from '#infrastructure/api/client'
import { tryRequest } from '#infrastructure/api/tryRequest'
import { failed, ok } from '~/utils/actionResult'

import type { SpaceSelectDeps } from '../loadSpaces'

export const createSpaceSelectDeps = (client: ApiClient): SpaceSelectDeps => ({
  loadSpaces: async ({ organizationId }) => {
    const response = await tryRequest(() =>
      organizationId
        ? client.GET('/api/movement/organization/{id}/spaces', {
            params: { path: { id: Number(organizationId) } },
          })
        : client.GET('/api/spaces'),
    )

    return response && 'data' in response && response.data !== undefined
      ? ok(
          response.data.map((space) => ({
            label: space.name,
            value: String(space.id),
          })),
        )
      : failed()
  },
})
