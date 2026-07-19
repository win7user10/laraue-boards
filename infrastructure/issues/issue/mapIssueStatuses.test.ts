import { assert, test } from 'vitest'

import { mapIssueStatuses } from './mapIssueStatuses'

test('maps statuses for the selected issue board', () => {
  assert.deepEqual(mapIssueStatuses([{ id: 4, name: 'Done' }]), [
    { id: '4', name: 'Done' },
  ])
})
