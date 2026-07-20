import { createApiClient } from '#infrastructure/api/client'
import { getOrganizationKey } from '#infrastructure/common/app-layout/organizationSelection'
import type { ViewOrganizationPickerPage } from '~/sections/organizations/select-organization/deps/viewOrganizationPickerPage'

export const openApiViewOrganizationPickerPage =
  (baseUrl: string): ViewOrganizationPickerPage =>
  async () => {
    const client = createApiClient(baseUrl)
    try {
      const response = await client.GET('/api/organizations')
      switch (response.response.status) {
        case 401:
        case 403:
          return err('AccessDenied')
        default:
          break
      }
      if (
        response.data?.some((organization) => organization.id === undefined)
      ) {
        return err('TemporarilyUnavailable')
      }
      if (!response.data) {
        return err('TemporarilyUnavailable')
      }
      return ok({
        OrganizationPickerPage: {
          organizations: response.data.map((organization) => ({
            color: organization.color ?? DEFAULT_COLOR,
            description: organization.isPersonal
              ? 'Personal organization'
              : 'Team organization',
            id: String(organization.id),
            initial: organization.name[0] ?? '?',
            key: getOrganizationKey(organization),
            name: organization.name,
          })),
        },
      })
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
import { DEFAULT_COLOR } from '~/constants/colors'
