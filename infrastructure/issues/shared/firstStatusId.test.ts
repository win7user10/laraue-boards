import { assert, test } from 'vitest'

import { getFirstStatusId } from '#infrastructure/issues/shared/firstStatusId'

test('selects the first board status when creating an issue', () => {
  assert.equal(
    getFirstStatusId([
      { id: 8, sortOrder: 2 },
      { id: 4, sortOrder: 1 },
    ]),
    '4',
  )
})
