import { assert, test } from 'vitest'

import { mapOrganizationMembers } from '#infrastructure/organizations/permissions/shared/mapOrganizationMembers'
import { COLORS } from '~/constants/colors'

test('maps organization members for the permissions list', () => {
  const members = mapOrganizationMembers([
    {
      adminAccessLevel: 1,
      color: COLORS.blue,
      displayName: 'Ada Lovelace',
      initials: 'AL',
      isOwner: false,
      organizationUserId: 7,
    },
    {
      adminAccessLevel: 0,
      color: COLORS.emerald,
      displayName: 'Owner',
      initials: 'O',
      isOwner: true,
    },
  ])

  assert.deepEqual(members, [
    {
      color: COLORS.blue,
      id: '7',
      initials: 'AL',
      isAdmin: true,
      isOwner: false,
      name: 'Ada Lovelace',
    },
  ])
})
