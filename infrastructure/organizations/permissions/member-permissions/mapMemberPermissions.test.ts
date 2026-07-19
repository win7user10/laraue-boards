import { assert, test } from 'vitest'

import {
  mapMemberPermissions,
  mapMemberPermissionsRequest,
} from './mapMemberPermissions'

test('maps organization permissions in both directions', () => {
  const permissions = mapMemberPermissions(
    {
      admin: 17,
      direct: {
        '2': { canRead: true, canUpdateIssues: true },
        '3': { canDelete: true },
      },
      global: { canCreateEpics: true, canRead: true },
    },
    [
      { id: '2', isDefault: false },
      { id: '3', isDefault: true },
    ],
  )

  assert.equal(permissions.admin.canManageMembers, true)
  assert.equal(permissions.admin.canManageAttributes, true)
  assert.equal(permissions.admin.canUpdateOrganization, false)
  assert.equal(permissions.global.canCreateBoards, true)
  assert.equal(permissions.direct['2']?.canUpdateIssues, true)
  assert.equal(permissions.direct['3']?.canRead, false)
  assert.equal(permissions.direct['3']?.canDelete, false)

  const request = mapMemberPermissionsRequest(permissions)
  assert.equal(request.admin, 17)
  assert.equal(request.global?.canCreateEpics, true)
  assert.equal(request.direct?.['2']?.canUpdateIssues, true)
  assert.equal(request.direct?.['3'], undefined)
})
