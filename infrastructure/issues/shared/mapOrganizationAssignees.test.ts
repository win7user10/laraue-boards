import { assert, test } from 'vitest'

import { mapOrganizationAssignees } from '#infrastructure/issues/shared/mapOrganizationAssignees'
import { COLORS } from '~/constants/colors'

test('maps space members for assignee selects', () => {
  assert.deepEqual(
    mapOrganizationAssignees([
      {
        color: COLORS.blue,
        displayName: 'Ada Lovelace',
        initials: 'AL',
        userId: '11111111-1111-1111-1111-111111111111',
      },
    ]),
    [
      {
        color: COLORS.blue,
        initials: 'AL',
        label: 'Ada Lovelace',
        value: '11111111-1111-1111-1111-111111111111',
      },
    ],
  )
})
