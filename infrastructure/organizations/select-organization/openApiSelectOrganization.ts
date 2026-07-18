import type { SelectOrganization } from '../../../app/sections/organizations/select-organization/actions/selectOrganization'
import { createApiClient } from '../../api/client'

export const openApiSelectOrganization =
  (baseUrl: string): SelectOrganization =>
  async ({ organizationId }) => {
    const client = createApiClient(baseUrl)
    try {
      const response = await client.POST('/api/organizations/login', {
        body: { organizationId },
        parseAs: 'text',
      })
      switch (response.response.status) {
        case 401:
        case 403:
          return err('AccessDenied')
        case 404:
          return err('OrganizationNotFound')
        default:
          break
      }
      if (!response.response.ok) {
        return err('TemporarilyUnavailable')
      }
      return ok(null)
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
