import { assert, test } from 'vitest'

import { findSpaceByKey } from './findSpaceByKey'

test('selects the space requested by the URL', () => {
  assert.deepEqual(findSpaceByKey([{ id: 2, key: 'DEF' }], 'DEF'), {
    id: 2,
    key: 'DEF',
  })
  assert.equal(findSpaceByKey([{ id: 2, key: 'DEF' }], 'OTHER'), undefined)
})
