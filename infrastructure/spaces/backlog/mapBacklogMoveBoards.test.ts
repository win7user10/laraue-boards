import { assert, test } from 'vitest'

import { mapBacklogMoveBoards } from './mapBacklogMoveBoards'

test('excludes the source backlog from move destinations', () => {
  assert.deepEqual(
    mapBacklogMoveBoards(
      [
        { id: 1, name: 'Backlog' },
        { id: 2, name: 'Board' },
      ],
      '1',
    ),
    [{ label: 'Board', value: '2' }],
  )
})
