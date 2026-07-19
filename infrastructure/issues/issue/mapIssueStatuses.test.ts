import { assert, test } from 'vitest'

import { mapIssueStatuses } from './mapIssueStatuses'

test('maps statuses for the selected issue board', () => {
  assert.deepEqual(
    mapIssueStatuses([
      { id: 4, name: 'Done', sortOrder: 2 },
      { id: 3, name: 'Todo', sortOrder: 1 },
    ]),
    [
      { id: '3', name: 'Todo' },
      { id: '4', name: 'Done' },
    ],
  )
})
