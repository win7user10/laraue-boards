import type { ApiClient } from '#infrastructure/api/client'
import { getOrganizationKey } from '#infrastructure/common/app-layout/organizationSelection'
import { DEFAULT_COLOR } from '~/constants/colors'
import type {
  OrganizationPickerPageDeps,
  SelectOrganizationFailure,
  ViewOrganizationPickerFailure,
} from '~/sections/organizations/select-organization/OrganizationPickerPage.deps'
import { err, ok } from '~/utils/actionResult'

const mapViewFailure = (
  status: number,
): undefined | ViewOrganizationPickerFailure => {
  if (status === 401 || status === 403) {
    return { type: 'accessDenied' }
  }
  if (status >= 500) {
    return { type: 'temporarilyUnavailable' }
  }
}

const mapSelectFailure = (
  status: number,
): SelectOrganizationFailure | undefined => {
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

export function createOrganizationPickerPageDeps(
  client: ApiClient,
): OrganizationPickerPageDeps {
  return {
    async select({ organizationId }) {
      const response = await client.POST('/api/organizations/login', {
        body: { organizationId },
        parseAs: 'text',
      })
      if ('data' in response) {
        return ok(null)
      }
      const failure = mapSelectFailure(response.response.status)
      if (failure) {
        return err(failure)
      }
      throw new Error(
        `Unrecognized select organization response: ${response.response.status}`,
      )
    },

    async view({ signal }) {
      const response = await client.GET('/api/organizations', { signal })
      if ('error' in response) {
        const failure = mapViewFailure(response.response.status)
        if (failure) {
          return err(failure)
        }
        throw new Error(
          `Unrecognized organizations response: ${response.response.status}`,
        )
      }
      return ok(
        response.data.map((organization) => {
          if (organization.id === undefined) {
            throw new TypeError('Organization id is required')
          }
          return {
            color: organization.color ?? DEFAULT_COLOR,
            description: organization.isPersonal
              ? 'Personal organization'
              : 'Team organization',
            id: String(organization.id),
            initial: organization.name[0] ?? '?',
            key: getOrganizationKey(organization),
            name: organization.name,
          }
        }),
      )
    },
  }
}
