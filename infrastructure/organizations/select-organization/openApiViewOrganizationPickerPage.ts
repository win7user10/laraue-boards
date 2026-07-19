import type { ViewOrganizationPickerPage } from '../../../app/sections/organizations/select-organization/actions/viewOrganizationPickerPage'
import { createApiClient } from '../../api/client'
import { getOrganizationKey } from '../../common/app-layout/organizationSelection'

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
            color: organization.color ?? '#3156d3',
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
