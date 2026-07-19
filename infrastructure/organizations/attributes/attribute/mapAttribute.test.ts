import { assert, test } from 'vitest'

import { mapAttribute } from './mapAttribute'

test('maps a list attribute', () => {
  assert.deepEqual(
    mapAttribute({
      color: '#12b76a',
      id: 3,
      listValues: [{ id: 4, name: 'High' }],
      name: 'Priority',
      type: 1,
    }),
    {
      color: '#12b76a',
      data: {
        listValues: [{ id: '4', name: 'High' }],
        type: 'list',
      },
      id: '3',
      name: 'Priority',
    },
  )
})
