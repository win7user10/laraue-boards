import { assert, test } from 'vitest'

import {
  createdAtDescending,
  mapIssueAttributes,
  mapIssueAttributeValues,
  mapIssueFilters,
  mapRawIssueFilters,
  updatedAtDescending,
} from './issueAttributes'

const attributeDtos = [
  { color: '#111111', id: 1, listValues: [], name: 'Reference', type: 0 },
  {
    color: '#222222',
    id: 2,
    listValues: [
      { id: 3, name: 'High' },
      { id: 4, name: 'Low' },
    ],
    name: 'Priority',
    type: 1,
  },
]

test('maps issue attributes, filters, values, and sorting to API models', () => {
  assert.deepEqual(mapIssueAttributes(attributeDtos), [
    { color: '#111111', id: '1', name: 'Reference', type: 'text' },
    {
      color: '#222222',
      id: '2',
      name: 'Priority',
      options: [
        { label: 'High', value: '3' },
        { label: 'Low', value: '4' },
      ],
      type: 'list',
    },
  ])
  assert.deepEqual(
    mapIssueFilters([
      { attributeId: '1', searchString: 'ABC', type: 'text' },
      { attributeId: '2', type: 'list', valueIds: ['3', '4'] },
    ]),
    {
      1: { $type: 'string', searchString: 'ABC' },
      2: { $type: 'enum', ids: ['3', '4'] },
    },
  )
  assert.deepEqual(
    mapRawIssueFilters({ 1: [' ABC '], 2: ['3', '4', '99'] }, attributeDtos)
      .filters,
    {
      1: { $type: 'string', searchString: 'ABC' },
      2: { $type: 'enum', ids: ['3', '4'] },
    },
  )
  assert.deepEqual(
    mapIssueAttributeValues([
      { attributeId: '1', type: 'text', value: 'ABC' },
      { attributeId: '2', type: 'list', valueId: '3' },
    ]),
    [
      { $type: 'string', attributeId: '1', value: 'ABC' },
      { $type: 'enum', attributeId: '2', valueId: '3' },
    ],
  )
  assert.deepEqual(createdAtDescending, {
    $type: 'property',
    direction: 1,
    property: 1,
  })
  assert.deepEqual(updatedAtDescending, {
    $type: 'property',
    direction: 1,
    property: 2,
  })
})
