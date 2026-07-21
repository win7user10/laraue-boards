import { createApiClient } from '#infrastructure/api/client'
import { getInvalidInputError } from '#infrastructure/api/getInvalidInputError'
import type { UpdateOrganization } from '~/sections/organizations/settings/deps/updateOrganization'

export const openApiUpdateOrganization =
  (baseUrl: string): UpdateOrganization =>
  async (input) => {
    const client = createApiClient(baseUrl)
    try {
      const response = await client.PUT('/api/organizations/{id}', {
        body: {
          color: input.color,
          id: input.id,
          name: input.name,
          slug: input.slug,
        },
        params: { path: { id: Number(input.id) } },
      })
      switch (response.response.status) {
        case 400:
          return err(getInvalidInputError(response.error))
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
      return ok({ slug: input.slug })
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
