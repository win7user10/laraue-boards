import { assert, test } from 'vitest'

import { mapOrganizationMembers } from './mapOrganizationMembers'

test('maps organization members for the permissions list', () => {
  const members = mapOrganizationMembers([
    {
      adminAccessLevel: 1,
      color: '#3156d3',
      displayName: 'Ada Lovelace',
      initials: 'AL',
      isOwner: false,
      organizationUserId: 7,
    },
    {
      adminAccessLevel: 0,
      color: '#039855',
      displayName: 'Owner',
      initials: 'O',
      isOwner: true,
    },
  ])

  assert.deepEqual(members, [
    {
      color: '#3156d3',
      id: '7',
      initials: 'AL',
      isAdmin: true,
      isOwner: false,
      name: 'Ada Lovelace',
    },
  ])
})
