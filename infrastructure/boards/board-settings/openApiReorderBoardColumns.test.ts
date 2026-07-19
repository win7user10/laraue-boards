import { assert, test } from 'vitest'

import { getBoardColumnSortOrders } from './openApiReorderBoardColumns'

test('maps board columns to one-based sort orders', () => {
  assert.deepEqual(getBoardColumnSortOrders(['8', '3', '5']), {
    3: 2,
    5: 3,
    8: 1,
  })
})
