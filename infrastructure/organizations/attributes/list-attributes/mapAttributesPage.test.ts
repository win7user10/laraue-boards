import assert from 'node:assert/strict'

import { test } from 'vitest'

import { mapAttributesPage } from './mapAttributesPage'

test('maps text and list attributes for the settings page', () => {
  const result = mapAttributesPage([
    {
      color: '#3156d3',
      id: 2,
      listValues: [],
      name: 'Reference',
      type: 0,
    },
    {
      color: '#12b76a',
      id: 3,
      listValues: [{ id: 4, name: 'High' }],
      name: 'Priority',
      type: 1,
    },
  ])

  assert.deepEqual(result.AttributesPage.attributes, [
    {
      color: '#3156d3',
      id: '2',
      name: 'Reference',
      type: 'text',
    },
    {
      color: '#12b76a',
      id: '3',
      name: 'Priority',
      type: 'list',
    },
  ])
})
