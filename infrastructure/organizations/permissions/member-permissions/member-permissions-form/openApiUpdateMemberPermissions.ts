import { createApiClient } from '#infrastructure/api/client'
import { getInvalidInputError } from '#infrastructure/api/getInvalidInputError'
import { mapMemberPermissionsRequest } from '#infrastructure/organizations/permissions/member-permissions/mapMemberPermissions'
import type { UpdateMemberPermissions } from '~/sections/organizations/permissions/member-permissions/components/MemberPermissionsForm/deps/updateMemberPermissions'

export const openApiUpdateMemberPermissions =
  (baseUrl: string): UpdateMemberPermissions =>
  async (input) => {
    const client = createApiClient(baseUrl)
    try {
      const response = await client.POST(
        '/api/organizations/permissions/{organizationUserId}',
        {
          body: {
            userPermissions: mapMemberPermissionsRequest(input.permissions),
          },
          params: { path: { organizationUserId: Number(input.memberId) } },
        },
      )
      switch (response.response.status) {
        case 400:
          return err(getInvalidInputError(response.error))
        case 401:
        case 403:
          return err('AccessDenied')
        case 404:
          return err('MemberNotFound')
      }
      return response.response.ok ? ok(null) : err('TemporarilyUnavailable')
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
