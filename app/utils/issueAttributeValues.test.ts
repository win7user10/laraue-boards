import { assert, test } from 'vitest'

import { getIssueAttributeValueInput } from '~/utils/issueAttributeValues'

test('maps edited issue attribute values to action input', () => {
  assert.deepEqual(
    getIssueAttributeValueInput({ 1: ' ABC ', 2: '3', 99: 'stale' }, [
      { id: '1', type: 'text' },
      { id: '2', type: 'list' },
    ]),
    [
      { attributeId: '1', type: 'text', value: 'ABC' },
      { attributeId: '2', type: 'list', valueId: '3' },
    ],
  )
})
