import { createApiClient } from '#infrastructure/api/client'
import { mapMemberPermissions } from '#infrastructure/organizations/permissions/member-permissions/mapMemberPermissions'
import { mapOrganizationMembers } from '#infrastructure/organizations/permissions/shared/mapOrganizationMembers'
import type { ViewMemberPermissionsPage } from '~/sections/organizations/permissions/member-permissions/deps/viewMemberPermissionsPage'

export const openApiViewMemberPermissionsPage =
  (baseUrl: string): ViewMemberPermissionsPage =>
  async (input) => {
    const client = createApiClient(baseUrl)
    try {
      const [membersResponse, permissionsResponse, spacesResponse] =
        await Promise.all([
          client.GET('/api/organizations/members'),
          client.GET('/api/organizations/permissions/{organizationUserId}', {
            params: {
              path: { organizationUserId: Number(input.memberId) },
            },
          }),
          client.GET('/api/organizations/permittable-entities'),
        ])
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
      switch (permissionsResponse.response.status) {
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
      switch (spacesResponse.response.status) {
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
      if (
        !membersResponse.data ||
        !permissionsResponse.data ||
        !spacesResponse.data
      ) {
        return err('TemporarilyUnavailable')
      }

      const member = mapOrganizationMembers(membersResponse.data).find(
        (item) => item.id === input.memberId,
      )
      if (!member) {
        return err('PermissionsNotFound')
      }
      const spaces = spacesResponse.data.map((space) => ({
        color: space.color,
        id: String(space.id),
        isDefault: space.isDefault,
        name: space.name,
      }))

      return ok({
        MemberPermissionsPage: {
          member,
          permissions: mapMemberPermissions(
            permissionsResponse.data,
            spaces.map(({ id, isDefault }) => ({ id, isDefault })),
          ),
          spaces,
        },
      })
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
