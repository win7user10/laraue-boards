import { createApiClient } from '#infrastructure/api/client'
import { getInvalidInputError } from '#infrastructure/api/getInvalidInputError'
import type { CreateOrganization } from '~/sections/organizations/create-organization/deps/createOrganization'

export const openApiCreateOrganization =
  (baseUrl: string): CreateOrganization =>
  async (input) => {
    const client = createApiClient(baseUrl)
    try {
      const response = await client.POST('/api/organizations', { body: input })
      switch (response.response.status) {
        case 400:
          return err(getInvalidInputError(response.error))
        case 401:
        case 403:
          return err('AccessDenied')
        default:
          break
      }
      if (response.data?.id === undefined) {
        return err('TemporarilyUnavailable')
      }
      return ok({ organizationId: String(response.data.id) })
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
