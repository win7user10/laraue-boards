import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import { DEFAULT_COLOR } from '~/constants/colors'
import type {
  AppLayoutData,
  AppLayoutDeps,
  ViewAppLayoutFailure,
} from '~/sections/common/app-layout/AppLayout.deps'
import { err, ok } from '~/utils/actionResult'
import { getOrganizationKey } from '~/utils/organizationKey'

type Schemas = components['schemas']

const getFailure = (status: number, context: string): ViewAppLayoutFailure => {
  if (status === 401 || status === 403) {
    return { type: 'accessDenied' }
  }
  if (status >= 500) {
    return { type: 'temporarilyUnavailable' }
  }
  throw new Error(`Unrecognized ${context} response: ${status}`)
}

const mapAppLayoutData = (
  organization: Schemas['OrganizationDto'],
  organizationMembership: Schemas['OrganizationListDto'],
  spaces: Schemas['SpaceListDto'][],
  user: Schemas['UserDto'],
): AppLayoutData => ({
  organization: {
    canCreateSpaces: organization.canCreateSpaces,
    canManage: organization.canManage,
    canManageAttributes: organization.canManageAttributes,
    canMassMove: organization.canMassMove,
    canUpdate: organizationMembership.canUpdate,
    color: organization.color ?? DEFAULT_COLOR,
    id: String(organization.id),
    initial: organization.name[0] ?? '?',
    name: organization.name,
  },
  spaces: spaces.map((space) => {
    if (space.id === undefined) {
      throw new TypeError('Space id is required')
    }
    return {
      color: space.color,
      id: String(space.id),
      key: space.key,
      name: space.name,
    }
  }),
  user: {
    color: user.color,
    initials: user.initials ?? '?',
    name:
      [user.firstName, user.lastName].filter(Boolean).join(' ') ||
      user.username ||
      user.initials ||
      'User',
  },
})

export function createAppLayoutDeps(client: ApiClient): AppLayoutDeps {
  return {
    async logout() {
      try {
        await client.POST('/api/user/logout')
      } catch {
        // Logging out locally must remain possible while the API is unavailable.
      }
    },

    async view({ organizationKey, signal }) {
      let [organization, organizations] = await Promise.all([
        client.GET('/api/organizations/current', { signal }),
        client.GET('/api/organizations', { signal }),
      ])
      const organizationsData =
        'data' in organizations ? organizations.data : undefined
      if (organizationsData === undefined) {
        return err(getFailure(organizations.response.status, 'organizations'))
      }
      const organizationMembership = organizationsData.find(
        (item) => getOrganizationKey(item) === organizationKey,
      )
      if (!organizationMembership) {
        return err({ type: 'workspaceNotFound' })
      }

      let organizationData =
        'data' in organization ? organization.data : undefined
      if (organizationData === undefined) {
        if (organization.response.status !== 404) {
          return err(
            getFailure(organization.response.status, 'current organization'),
          )
        }
      }

      if (
        organizationData === undefined ||
        String(organizationData.id) !== String(organizationMembership.id)
      ) {
        if (import.meta.server) {
          return err({ type: 'organizationSwitchRequired' })
        }
        const selection = await client.POST('/api/organizations/login', {
          body: { organizationId: organizationMembership.id },
          parseAs: 'text',
        })
        if ('data' in selection) {
          organization = await client.GET('/api/organizations/current', {
            signal,
          })
          organizationData =
            'data' in organization ? organization.data : undefined
        } else {
          if (selection.response.status === 404) {
            return err({ type: 'workspaceNotFound' })
          }
          return err(
            getFailure(selection.response.status, 'organization selection'),
          )
        }
      }

      if (organizationData === undefined) {
        if (organization.response.status === 404) {
          return err({ type: 'workspaceNotFound' })
        }
        return err(
          getFailure(organization.response.status, 'current organization'),
        )
      }
      if (String(organizationData.id) !== String(organizationMembership.id)) {
        return err({ type: 'workspaceNotFound' })
      }

      const [user, spaces] = await Promise.all([
        client.GET('/api/user', { signal }),
        client.GET('/api/spaces', { signal }),
      ])
      const userData = 'data' in user ? user.data : undefined
      if (userData === undefined) {
        if (user.response.status === 404) {
          return err({ type: 'accessDenied' })
        }
        return err(getFailure(user.response.status, 'user'))
      }
      const spacesData = 'data' in spaces ? spaces.data : undefined
      if (spacesData === undefined) {
        if (spaces.response.status === 404) {
          return err({ type: 'workspaceNotFound' })
        }
        return err(getFailure(spaces.response.status, 'spaces'))
      }

      return ok(
        mapAppLayoutData(
          organizationData,
          organizationMembership,
          spacesData,
          userData,
        ),
      )
    },
  }
}
