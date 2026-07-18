import type { ViewDataMovementPage } from '../../../app/sections/organizations/data-movement/actions/viewDataMovementPage'
import { createApiClient } from '../../api/client'
import { mapDataMovementPage } from './mapDataMovementPage'

export const openApiViewDataMovementPage = (
  baseUrl: string,
): ViewDataMovementPage => {
  const client = createApiClient(baseUrl)
  return async () => {
    try {
      const current = await client.GET('/api/organizations/current')
      switch (current.response.status) {
        case 200:
          break
        case 401:
        case 403:
        case 404:
          return err('AccessDenied')
        default:
          return err('TemporarilyUnavailable')
      }
      if (!current.data || !current.data.canMassMove) {
        return err('AccessDenied')
      }

      const [organizations, spaces, destinationSpaces] = await Promise.all([
        client.GET('/api/organizations'),
        client.GET('/api/spaces'),
        client.GET('/api/movement/organization/{id}/spaces', {
          params: { path: { id: Number(current.data.id) } },
        }),
      ])
      switch (organizations.response.status) {
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
      switch (destinationSpaces.response.status) {
        case 200:
          break
        case 401:
        case 403:
          return err('AccessDenied')
        default:
          return err('TemporarilyUnavailable')
      }
      if (!organizations.data || !spaces.data || !destinationSpaces.data) {
        return err('TemporarilyUnavailable')
      }

      const boardResponses = await Promise.all(
        spaces.data.map((space) =>
          client.GET('/api/spaces/{id}/epics', {
            params: { path: { id: Number(space.id) } },
          }),
        ),
      )
      for (const response of boardResponses) {
        switch (response.response.status) {
          case 200:
            if (!response.data) {
              return err('TemporarilyUnavailable')
            }
            break
          case 401:
          case 403:
            return err('AccessDenied')
          default:
            return err('TemporarilyUnavailable')
        }
      }

      return ok(
        mapDataMovementPage(
          current.data,
          organizations.data,
          spaces.data,
          destinationSpaces.data,
          boardResponses.map((response) => response.data ?? []),
        ),
      )
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
}
