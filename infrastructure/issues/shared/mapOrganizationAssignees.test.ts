import assert from 'node:assert/strict'

import { test } from 'vitest'

import { mapOrganizationAssignees } from './mapOrganizationAssignees'

test('maps space members for assignee selects', () => {
  assert.deepEqual(
    mapOrganizationAssignees([
      {
        displayName: 'Ada Lovelace',
        initials: 'AL',
        userId: '11111111-1111-1111-1111-111111111111',
      },
    ]),
    [
      {
        label: 'Ada Lovelace',
        value: '11111111-1111-1111-1111-111111111111',
      },
    ],
  )
})
