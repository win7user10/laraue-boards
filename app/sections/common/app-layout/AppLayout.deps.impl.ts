import type { ApiClient } from '#infrastructure/api/client'
import { DEFAULT_COLOR } from '~/constants/colors'
import type {
  AppLayoutDeps,
  ViewAppLayoutFailure,
} from '~/sections/common/app-layout/AppLayout.deps'
import { err, ok } from '~/utils/actionResult'
import { getOrganizationKey } from '~/utils/organizationKey'

const mapFailure = (status: number): undefined | ViewAppLayoutFailure => {
  if (status === 401 || status === 403) {
    return { type: 'accessDenied' }
  }
  if (status >= 500) {
    return { type: 'temporarilyUnavailable' }
  }
}

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
        const failure = mapFailure(organizations.response.status)
        if (failure) {
          return err(failure)
        }
        throw new Error(
          `Unrecognized organizations response: ${organizations.response.status}`,
        )
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
          const failure = mapFailure(organization.response.status)
          if (failure) {
            return err(failure)
          }
          throw new Error(
            `Unrecognized current organization response: ${organization.response.status}`,
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
          const failure = mapFailure(selection.response.status)
          if (failure) {
            return err(failure)
          }
          throw new Error(
            `Unrecognized organization selection response: ${selection.response.status}`,
          )
        }
      }

      if (organizationData === undefined) {
        if (organization.response.status === 404) {
          return err({ type: 'workspaceNotFound' })
        }
        const failure = mapFailure(organization.response.status)
        if (failure) {
          return err(failure)
        }
        throw new Error(
          `Unrecognized current organization response: ${organization.response.status}`,
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
        const failure = mapFailure(user.response.status)
        if (failure) {
          return err(failure)
        }
        throw new Error(`Unrecognized user response: ${user.response.status}`)
      }
      const spacesData = 'data' in spaces ? spaces.data : undefined
      if (spacesData === undefined) {
        if (spaces.response.status === 404) {
          return err({ type: 'workspaceNotFound' })
        }
        const failure = mapFailure(spaces.response.status)
        if (failure) {
          return err(failure)
        }
        throw new Error(
          `Unrecognized spaces response: ${spaces.response.status}`,
        )
      }

      return ok({
        organization: {
          canCreateSpaces: organizationData.canCreateSpaces,
          canManage: organizationData.canManage,
          canManageAttributes: organizationData.canManageAttributes,
          canMassMove: organizationData.canMassMove,
          canUpdate: organizationMembership.canUpdate,
          color: organizationData.color ?? DEFAULT_COLOR,
          id: String(organizationData.id),
          initial: organizationData.name[0] ?? '?',
          name: organizationData.name,
        },
        spaces: spacesData.map((space) => {
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
          color: userData.color,
          initials: userData.initials ?? '?',
          name:
            [userData.firstName, userData.lastName].filter(Boolean).join(' ') ||
            userData.username ||
            userData.initials ||
            'User',
        },
      })
    },
  }
}
