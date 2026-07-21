import type { components } from '#infrastructure/api/generated'
import type { MemberPermissions } from '~/sections/organizations/permissions/member-permissions/components/MemberPermissionsForm/MemberPermissionsForm.vue'

type ApiUserPermissions = components['schemas']['UserPermissions']

const adminFlags = {
  canDeleteOrganization: 4,
  canManageAttributes: 16,
  canManageMembers: 1,
  canMoveData: 8,
  canUpdateOrganization: 2,
} as const

export const mapMemberPermissions = (
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

export const mapMemberPermissionsRequest = (
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
