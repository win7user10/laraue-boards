import type { LoadDataMovementSpaces } from '../../../app/sections/organizations/data-movement/actions/loadDataMovementSpaces'
import { createApiClient } from '../../api/client'
import { mapMoveOptions } from '../../shared/mapMoveOptions'

export const openApiLoadDataMovementSpaces = (
  baseUrl: string,
): LoadDataMovementSpaces => {
  const client = createApiClient(baseUrl)
  return async ({ organizationId }) => {
    try {
      const response = await client.GET(
        '/api/movement/organization/{id}/spaces',
        {
          params: { path: { id: Number(organizationId) } },
        },
      )
      switch (response.response.status) {
        case 200:
          break
        case 401:
        case 403:
          return err('AccessDenied')
        case 404:
          return err('OrganizationNotFound')
        default:
          return err('TemporarilyUnavailable')
      }
      if (!response.data) {
        return err('TemporarilyUnavailable')
      }
      return ok({ spaces: mapMoveOptions(response.data) })
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
}
