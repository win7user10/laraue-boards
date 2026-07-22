import type { ApiClient } from '#infrastructure/api/client'
import { mapOrganizationMembers } from '#infrastructure/organizations/permissions/shared/mapOrganizationMembers'
import type {
  PermissionsPageDeps,
  ViewPermissionsFailure,
} from '~/sections/organizations/permissions/list-members/PermissionsPage.deps'
import { err, ok } from '~/utils/actionResult'

const mapFailure = (status: number): undefined | ViewPermissionsFailure => {
  if (status === 401 || status === 403) {
    return { type: 'accessDenied' }
  }
  if (status === 404) {
    return { type: 'permissionsNotFound' }
  }
  if (status >= 500) {
    return { type: 'temporarilyUnavailable' }
  }
}

export function createPermissionsPageDeps(
  client: ApiClient,
): PermissionsPageDeps {
  return {
    async view({ signal }) {
      const response = await client.GET('/api/organizations/members', {
        signal,
      })
      if (!response.response.ok) {
        const failure = mapFailure(response.response.status)
        if (failure) {
          return err(failure)
        }
        throw new Error(
          `Unrecognized permissions response: ${response.response.status}`,
        )
      }
      if (!response.data) {
        throw new Error('Permissions response has no data')
      }
      return ok(mapOrganizationMembers(response.data))
    },
  }
}
