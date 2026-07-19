import { DEFAULT_COLOR } from '../../../app/constants/colors'
import type { ViewAppLayout } from '../../../app/sections/common/app-layout/actions/viewAppLayout'
import { createApiClient } from '../../api/client'
import {
  findOrganizationByKey,
  shouldSelectOrganization,
} from './organizationSelection'

export const openApiViewAppLayout =
  (baseUrl: string): ViewAppLayout =>
  async ({ organizationKey }) => {
    const client = createApiClient(baseUrl)

    try {
      let [organization, organizations] = await Promise.all([
        client.GET('/api/organizations/current'),
        client.GET('/api/organizations'),
      ])
      switch (organization.response.status) {
        case 200:
          if (!organization.data) {
            return err('TemporarilyUnavailable')
          }
          break
        case 401:
        case 403:
          return err('AccessDenied')
        case 404:
          break
        default:
          return err('TemporarilyUnavailable')
      }
      switch (organizations.response.status) {
        case 200:
          break
        case 401:
        case 403:
          return err('AccessDenied')
        default:
          return err('TemporarilyUnavailable')
      }
      if (!organizations.data) {
        return err('TemporarilyUnavailable')
      }
      const organizationMembership = findOrganizationByKey(
        organizations.data,
        organizationKey,
      )
      if (!organizationMembership) {
        return err('WorkspaceNotFound')
      }

      if (
        organization.response.status === 404 ||
        shouldSelectOrganization(
          organization.data?.id,
          String(organizationMembership.id),
        )
      ) {
        if (import.meta.server) {
          return err('OrganizationSwitchRequired')
        }
        const selection = await client.POST('/api/organizations/login', {
          body: { organizationId: organizationMembership.id },
          parseAs: 'text',
        })
        switch (selection.response.status) {
          case 200:
            break
          case 401:
          case 403:
            return err('AccessDenied')
          case 404:
            return err('WorkspaceNotFound')
          default:
            return err('TemporarilyUnavailable')
        }
        organization = await client.GET('/api/organizations/current')
        switch (organization.response.status) {
          case 200:
            break
          case 401:
          case 403:
            return err('AccessDenied')
          case 404:
            return err('WorkspaceNotFound')
          default:
            return err('TemporarilyUnavailable')
        }
      }

      const [user, spaces] = await Promise.all([
        client.GET('/api/user'),
        client.GET('/api/spaces'),
      ])
      switch (user.response.status) {
        case 200:
          break
        case 401:
        case 403:
        case 404:
          return err('AccessDenied')
        default:
          return err('TemporarilyUnavailable')
      }
      switch (spaces.response.status) {
        case 200:
          break
        case 401:
        case 403:
          return err('AccessDenied')
        case 404:
          return err('WorkspaceNotFound')
        default:
          return err('TemporarilyUnavailable')
      }
      if (
        !organization.data ||
        !user.data ||
        !spaces.data ||
        spaces.data.some((space) => space.id === undefined)
      ) {
        return err('TemporarilyUnavailable')
      }
      if (String(organization.data.id) !== String(organizationMembership.id)) {
        return err('WorkspaceNotFound')
      }

      return ok({
        AppLayout: {
          organization: {
            canCreateSpaces: organization.data.canCreateSpaces,
            canManage: organization.data.canManage,
            canManageAttributes: organization.data.canManageAttributes,
            canMassMove: organization.data.canMassMove,
            canUpdate: organizationMembership.canUpdate,
            color: organization.data.color ?? DEFAULT_COLOR,
            id: String(organization.data.id),
            initial: organization.data.name[0] ?? '?',
            name: organization.data.name,
          },
          spaces: spaces.data.map((space) => ({
            color: space.color,
            id: String(space.id),
            key: space.key,
            name: space.name,
          })),
          user: {
            color: user.data.color,
            initials: user.data.initials ?? '?',
            name:
              [user.data.firstName, user.data.lastName]
                .filter(Boolean)
                .join(' ') ||
              user.data.username ||
              user.data.initials ||
              'User',
          },
        },
      })
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
