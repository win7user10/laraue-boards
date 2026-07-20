import { assert, test } from 'vitest'

import { mapAttribute } from '#infrastructure/organizations/attributes/attribute/mapAttribute'
import { COLORS } from '~/constants/colors'

test('maps a list attribute', () => {
  assert.deepEqual(
    mapAttribute({
      color: COLORS.green,
      id: 3,
      listValues: [{ id: 4, name: 'High' }],
      name: 'Priority',
      type: 1,
    }),
    {
      color: COLORS.green,
      data: {
        listValues: [{ id: '4', name: 'High' }],
        type: 'list',
      },
      id: '3',
      name: 'Priority',
    },
  )
})
