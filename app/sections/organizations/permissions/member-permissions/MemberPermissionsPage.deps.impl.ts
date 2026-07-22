import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import { getInvalidInputError } from '#infrastructure/api/getInvalidInputError'
import { mapOrganizationMembers } from '#infrastructure/organizations/permissions/shared/mapOrganizationMembers'
import type {
  MemberPermissions,
  MemberPermissionsPageDeps,
  UpdateMemberPermissionsFailure,
  ViewMemberPermissionsFailure,
} from '~/sections/organizations/permissions/member-permissions/MemberPermissionsPage.deps'
import { err, ok } from '~/utils/actionResult'

type ApiUserPermissions = components['schemas']['UserPermissions']

const adminFlags = {
  canDeleteOrganization: 4,
  canManageAttributes: 16,
  canManageMembers: 1,
  canMoveData: 8,
  canUpdateOrganization: 2,
} as const

const mapMemberPermissions = (
  permissions: ApiUserPermissions,
  spaces: Array<{ id: string; isDefault: boolean }>,
): MemberPermissions => {
  const admin = permissions.admin ?? 0
  const global = permissions.global ?? {}

  return {
    admin: {
      canDeleteOrganization: (admin & adminFlags.canDeleteOrganization) !== 0,
      canManageAttributes: (admin & adminFlags.canManageAttributes) !== 0,
      canManageMembers: (admin & adminFlags.canManageMembers) !== 0,
      canMoveData: (admin & adminFlags.canMoveData) !== 0,
      canUpdateOrganization: (admin & adminFlags.canUpdateOrganization) !== 0,
    },
    direct: Object.fromEntries(
      spaces.map((space) => {
        const direct = permissions.direct?.[space.id]
        return [
          space.id,
          {
            canCreateBoards: direct?.canCreateEpics ?? false,
            canCreateIssues: direct?.canCreateIssues ?? false,
            canDelete: space.isDefault ? false : (direct?.canDelete ?? false),
            canDeleteBoards: direct?.canDeleteEpics ?? false,
            canDeleteIssues: direct?.canDeleteIssues ?? false,
            canRead: direct?.canRead ?? false,
            canUpdate: direct?.canUpdate ?? false,
            canUpdateBoards: direct?.canUpdateEpics ?? false,
            canUpdateIssues: direct?.canUpdateIssues ?? false,
          },
        ]
      }),
    ),
    global: {
      canCreateBoards: global.canCreateEpics ?? false,
      canCreateIssues: global.canCreateIssues ?? false,
      canCreateSpaces: global.canCreateSpaces ?? false,
      canDeleteBoards: global.canDeleteEpics ?? false,
      canDeleteIssues: global.canDeleteIssues ?? false,
      canDeleteSpaces: global.canDeleteSpaces ?? false,
      canRead: global.canRead ?? false,
      canUpdateBoards: global.canUpdateEpics ?? false,
      canUpdateIssues: global.canUpdateIssues ?? false,
      canUpdateSpaces: global.canUpdateSpaces ?? false,
    },
  }
}

const mapMemberPermissionsRequest = (
  permissions: MemberPermissions,
): ApiUserPermissions => ({
  admin: Object.entries(adminFlags).reduce(
    (result, [key, flag]) =>
      permissions.admin[key as keyof MemberPermissions['admin']]
        ? result | flag
        : result,
    0,
  ),
  direct: Object.fromEntries(
    Object.entries(permissions.direct)
      .filter(([, direct]) => Object.values(direct).some(Boolean))
      .map(([spaceId, direct]) => [
        spaceId,
        {
          canCreateEpics: direct.canCreateBoards,
          canCreateIssues: direct.canCreateIssues,
          canDelete: direct.canDelete,
          canDeleteEpics: direct.canDeleteBoards,
          canDeleteIssues: direct.canDeleteIssues,
          canRead: direct.canRead,
          canUpdate: direct.canUpdate,
          canUpdateEpics: direct.canUpdateBoards,
          canUpdateIssues: direct.canUpdateIssues,
        },
      ]),
  ),
  global: {
    canCreateEpics: permissions.global.canCreateBoards,
    canCreateIssues: permissions.global.canCreateIssues,
    canCreateSpaces: permissions.global.canCreateSpaces,
    canDeleteEpics: permissions.global.canDeleteBoards,
    canDeleteIssues: permissions.global.canDeleteIssues,
    canDeleteSpaces: permissions.global.canDeleteSpaces,
    canRead: permissions.global.canRead,
    canUpdateEpics: permissions.global.canUpdateBoards,
    canUpdateIssues: permissions.global.canUpdateIssues,
    canUpdateSpaces: permissions.global.canUpdateSpaces,
  },
})

const mapViewFailure = (
  status: number,
): undefined | ViewMemberPermissionsFailure => {
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

const mapUpdateFailure = (
  status: number,
  error: unknown,
): undefined | UpdateMemberPermissionsFailure => {
  if (status === 400) {
    return {
      message: getInvalidInputError(error).message,
      type: 'invalidInput',
    }
  }
  if (status === 401 || status === 403) {
    return { type: 'accessDenied' }
  }
  if (status === 404) {
    return { type: 'memberNotFound' }
  }
  if (status >= 500) {
    return { type: 'temporarilyUnavailable' }
  }
}

export function createMemberPermissionsPageDeps(
  client: ApiClient,
): MemberPermissionsPageDeps {
  return {
    async update(input) {
      const response = await client.POST(
        '/api/organizations/permissions/{organizationUserId}',
        {
          body: {
            userPermissions: mapMemberPermissionsRequest(input.permissions),
          },
          params: { path: { organizationUserId: Number(input.memberId) } },
        },
      )
      if (response.response.ok) {
        return ok(undefined)
      }
      const failure = mapUpdateFailure(response.response.status, response.error)
      if (failure) {
        return err(failure)
      }
      throw new Error(
        `Unrecognized update permissions response: ${response.response.status}`,
      )
    },

    async view({ memberId, signal }) {
      const responses = await Promise.all([
        client.GET('/api/organizations/members', { signal }),
        client.GET('/api/organizations/permissions/{organizationUserId}', {
          params: { path: { organizationUserId: Number(memberId) } },
          signal,
        }),
        client.GET('/api/organizations/permittable-entities', { signal }),
      ])

      for (const response of responses) {
        if (response.response.ok) {
          continue
        }
        const failure = mapViewFailure(response.response.status)
        if (failure) {
          return err(failure)
        }
        throw new Error(
          `Unrecognized member permissions response: ${response.response.status}`,
        )
      }

      const [membersResponse, permissionsResponse, spacesResponse] = responses
      if (
        !membersResponse.data ||
        !permissionsResponse.data ||
        !spacesResponse.data
      ) {
        throw new Error('Member permissions response has no data')
      }
      const member = mapOrganizationMembers(membersResponse.data).find(
        (item) => item.id === memberId,
      )
      if (!member) {
        return err({ type: 'permissionsNotFound' })
      }
      const spaces = spacesResponse.data.map((space) => ({
        color: space.color,
        id: String(space.id),
        isDefault: space.isDefault,
        name: space.name,
      }))
      return ok({
        member,
        permissions: mapMemberPermissions(
          permissionsResponse.data,
          spaces.map(({ id, isDefault }) => ({ id, isDefault })),
        ),
        spaces,
      })
    },
  }
}
