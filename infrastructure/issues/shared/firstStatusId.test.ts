import assert from 'node:assert/strict'

import { test } from 'vitest'

import { getFirstStatusId } from './firstStatusId'

test('selects the first board status when creating an issue', () => {
  assert.equal(
    getFirstStatusId([
      { id: 8, sortOrder: 2 },
      { id: 4, sortOrder: 1 },
    ]),
    '4',
  )
})
