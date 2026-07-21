import { createApiClient } from '#infrastructure/api/client'
import type { MoveSpaces } from '~/sections/organizations/data-movement/deps/moveSpaces'

export const openApiMoveSpaces = (baseUrl: string): MoveSpaces => {
  const client = createApiClient(baseUrl)
  return async ({ destinationOrganizationId, spaceIds }) => {
    if (!destinationOrganizationId || !spaceIds.length) {
      return err('InvalidDestination')
    }
    try {
      const responses = await Promise.all(
        spaceIds.map((spaceId) =>
          client.POST(
            '/api/movement/space/{id}/to-organization/{organizationId}',
            {
              params: {
                path: {
                  id: Number(spaceId),
                  organizationId: Number(destinationOrganizationId),
                },
              },
            },
          ),
        ),
      )
      for (const response of responses) {
        switch (response.response.status) {
          case 200:
            break
          case 400:
            return err('InvalidDestination')
          case 401:
          case 403:
            return err('AccessDenied')
          case 404:
            return err('ResourceNotFound')
          default:
            return err('TemporarilyUnavailable')
        }
      }
      return ok(null)
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
}
