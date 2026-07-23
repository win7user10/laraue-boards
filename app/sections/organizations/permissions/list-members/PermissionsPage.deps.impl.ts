import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import type {
  PermissionsPageDeps,
  ViewPermissionsFailure,
} from '~/sections/organizations/permissions/list-members/PermissionsPage.deps'
import { err, ok } from '~/utils/actionResult'

type OrganizationMember = components['schemas']['OrganizationMember']

const mapOrganizationMembers = (members: OrganizationMember[]) =>
  members.flatMap((member) => {
    if (member.organizationUserId === undefined) {
      return []
    }
    return [
      {
        color: member.color,
        id: String(member.organizationUserId),
        initials: member.initials,
        isAdmin: member.adminAccessLevel !== 0,
        isOwner: member.isOwner,
        name: member.displayName,
      },
    ]
  })

const mapFailure = (status: number): undefined | ViewPermissionsFailure => {
  if (status === 401 || status === 403) {
    return { type: 'accessDenied' }
  }
  if (status === 404) {
    return { type: 'permissionsNotFound' }
  }
  if (status >= 500) {
    return { type: 'temporarilyUnavailable' }
  }
}

export function createPermissionsPageDeps(
  client: ApiClient,
): PermissionsPageDeps {
  return {
    async view({ signal }) {
      const response = await client.GET('/api/organizations/members', {
        signal,
      })
      if ('error' in response) {
        const failure = mapFailure(response.response.status)
        if (failure) {
          return err(failure)
        }
        throw new Error(
          `Unrecognized permissions response: ${response.response.status}`,
        )
      }
      return ok(mapOrganizationMembers(response.data))
    },
  }
}
