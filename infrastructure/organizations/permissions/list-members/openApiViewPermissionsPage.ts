import type { ViewPermissionsPage } from '../../../../app/sections/organizations/permissions/list-members/actions/viewPermissionsPage'
import { createApiClient } from '../../../api/client'
import { mapOrganizationMembers } from '../shared/mapOrganizationMembers'

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
