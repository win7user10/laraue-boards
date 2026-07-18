import type { SelectOrganization } from '../../../app/sections/organizations/select-organization/actions/selectOrganization'
import { createApiClient } from '../../api/client'
import { getUserToken, setOrganizationToken } from '../../auth/tokenStorage'

export const openApiSelectOrganization =
  (baseUrl: string): SelectOrganization =>
  async ({ organizationId }) => {
    const client = createApiClient(baseUrl, getUserToken())
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
      if (!response.data) {
        return err('TemporarilyUnavailable')
      }
      setOrganizationToken(response.data)
      return ok(null)
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
