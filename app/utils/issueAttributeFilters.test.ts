import { assert, test } from 'vitest'

import {
  getIssueAttributeFilterInput,
  normalizeIssueAttributeFilters,
  readIssueAttributeQuery,
  readIssueSpaceQuery,
  withIssueAttributeFilters,
} from './issueAttributeFilters'

const attributes = [
  { id: '1', type: 'text' as const },
  {
    id: '2',
    options: [{ value: '3' }, { value: '4' }],
    type: 'list' as const,
  },
]

test('maps issue filters between URL and action input', () => {
  const raw = readIssueAttributeQuery({
    'attribute.1': ' ABC ',
    'attribute.2': ['3', '4', '99'],
    'attribute.99': 'stale',
    page: '3',
  })
  const values = normalizeIssueAttributeFilters(raw, attributes)

  assert.deepEqual(values, { 1: 'ABC', 2: ['3', '4'] })
  assert.deepEqual(getIssueAttributeFilterInput(values, attributes), [
    { attributeId: '1', searchString: 'ABC', type: 'text' },
    { attributeId: '2', type: 'list', valueIds: ['3', '4'] },
  ])
  assert.deepEqual(
    withIssueAttributeFilters({ page: '3', search: 'x' }, values, attributes),
    {
      'attribute.1': 'ABC',
      'attribute.2': ['3', '4'],
      search: 'x',
    },
  )
  assert.deepEqual(readIssueSpaceQuery(['10', '20', null, '10']), ['10', '20'])
})
