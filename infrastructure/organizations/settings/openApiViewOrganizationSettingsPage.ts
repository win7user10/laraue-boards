import { DEFAULT_COLOR } from '../../../app/constants/colors'
import type { ViewOrganizationSettingsPage } from '../../../app/sections/organizations/settings/actions/viewOrganizationSettingsPage'
import { createApiClient } from '../../api/client'

export const openApiViewOrganizationSettingsPage =
  (baseUrl: string): ViewOrganizationSettingsPage =>
  async () => {
    const client = createApiClient(baseUrl)
    try {
      const [response, organizations] = await Promise.all([
        client.GET('/api/organizations/current'),
        client.GET('/api/organizations'),
      ])
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
      switch (organizations.response.status) {
        case 200:
          break
        case 401:
        case 403:
          return err('AccessDenied')
        default:
          return err('TemporarilyUnavailable')
      }
      if (!response.data || !organizations.data) {
        return err('TemporarilyUnavailable')
      }
      const organization = organizations.data.find(
        (item) => item.id === response.data!.id,
      )
      if (!organization) {
        return err('TemporarilyUnavailable')
      }
      return ok({
        OrganizationSettingsPage: {
          canUpdate: organization.canUpdate,
          color: response.data.color ?? DEFAULT_COLOR,
          id: String(response.data.id),
          name: response.data.name,
          slug: response.data.slug,
          slugPostfix: response.data.slugPostfix,
        },
      })
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
