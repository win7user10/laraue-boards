import { createApiClient } from '#infrastructure/api/client'
import { mapOrganizationMembers } from '#infrastructure/organizations/permissions/shared/mapOrganizationMembers'
import type { ViewPermissionsPage } from '~/sections/organizations/permissions/list-members/deps/viewPermissionsPage'

export const openApiViewPermissionsPage =
  (baseUrl: string): ViewPermissionsPage =>
  async () => {
    const client = createApiClient(baseUrl)
    try {
      const membersResponse = await client.GET('/api/organizations/members')
      switch (membersResponse.response.status) {
        case 200:
          break
        case 401:
        case 403:
          return err('AccessDenied')
        case 404:
          return err('PermissionsNotFound')
        default:
          return err('TemporarilyUnavailable')
      }
      if (!membersResponse.data) {
        return err('TemporarilyUnavailable')
      }
      return ok({
        PermissionsPage: {
          members: mapOrganizationMembers(membersResponse.data),
        },
      })
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
