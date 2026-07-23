import type { ApiClient } from '#infrastructure/api/client'
import { tryRequest } from '#infrastructure/api/tryRequest'
import { failed, ok } from '~/utils/actionResult'

import type { OrganizationSelectDeps } from '../loadOrganizations'

export const createOrganizationSelectDeps = (client: ApiClient): OrganizationSelectDeps => ({
  loadOrganizations: async () => {
    const response = await tryRequest(() => client.GET('/api/organizations'))

    return response && 'data' in response && response.data !== undefined
      ? ok(
          response.data.map((organization) => ({
            label: organization.name,
            value: String(organization.id),
          })),
        )
      : failed()
  },
})
