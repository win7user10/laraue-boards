import type { ApiClient } from '#infrastructure/api/client'
import { getInvalidInputError } from '#infrastructure/api/getInvalidInputError'
import { DEFAULT_COLOR } from '~/constants/colors'
import type {
  OrganizationSettingsPageDeps,
  UpdateOrganizationFailure,
  ViewOrganizationSettingsFailure,
} from '~/sections/organizations/settings/OrganizationSettingsPage.deps'
import { err, ok } from '~/utils/actionResult'

const mapViewFailure = (status: number): undefined | ViewOrganizationSettingsFailure => {
  if (status === 401 || status === 403) {
    return { type: 'accessDenied' }
  }
  if (status === 404) {
    return { type: 'organizationNotFound' }
  }
  if (status >= 500) {
    return { type: 'temporarilyUnavailable' }
  }
}

const mapUpdateFailure = (
  status: number,
  error: unknown,
): undefined | UpdateOrganizationFailure => {
  if (status === 400) {
    return {
      message: getInvalidInputError(error).message,
      type: 'invalidInput',
    }
  }
  return mapViewFailure(status)
}

const unrecognizedResponse = (operation: string, status: number): never => {
  throw new Error(`Unrecognized ${operation} response: ${status}`)
}

export function createOrganizationSettingsPageDeps(
  client: ApiClient,
): OrganizationSettingsPageDeps {
  return {
    async updateOrganization(input) {
      const response = await client.PUT('/api/organizations/{id}', {
        body: {
          color: input.color,
          id: input.id,
          name: input.name,
          slug: input.slug,
        },
        params: { path: { id: Number(input.id) } },
      })
      if ('data' in response) {
        return ok(undefined)
      }

      const failure = mapUpdateFailure(response.response.status, response.error)
      return failure
        ? err(failure)
        : unrecognizedResponse('update organization', response.response.status)
    },

    async view({ signal }) {
      const [current, organizations] = await Promise.all([
        client.GET('/api/organizations/current', { signal }),
        client.GET('/api/organizations', { signal }),
      ])

      if ('error' in current) {
        const failure = mapViewFailure(current.response.status)
        if (failure) {
          return err(failure)
        }
        return unrecognizedResponse('view organization settings', current.response.status)
      }
      if ('error' in organizations) {
        const response = organizations
        const failure = mapViewFailure(response.response.status)
        if (failure) {
          return err(failure)
        }
        return unrecognizedResponse('view organization settings', response.response.status)
      }

      const organization = organizations.data.find(
        (item) => String(item.id) === String(current.data.id),
      )
      if (!organization) {
        throw new Error('Current organization is absent from organization list')
      }

      return ok({
        canUpdate: organization.canUpdate,
        color: current.data.color ?? DEFAULT_COLOR,
        id: String(current.data.id),
        name: current.data.name,
        slug: current.data.slug,
      })
    },
  }
}
