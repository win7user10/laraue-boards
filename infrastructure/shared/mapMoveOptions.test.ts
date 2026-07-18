import assert from 'node:assert/strict'

import { test } from 'vitest'

import { mapMoveOptions } from './mapMoveOptions'

test('maps movement destinations', () => {
  assert.deepEqual(
    mapMoveOptions([
      { id: 2, name: 'Product' },
      { id: '3', name: 'Support' },
    ]),
    [
      { label: 'Product', value: '2' },
      { label: 'Support', value: '3' },
    ],
  )
})
