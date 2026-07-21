import { assert, test } from 'vitest'

import { mapAttributesPage } from '#infrastructure/organizations/attributes/list-attributes/mapAttributesPage'
import { COLORS } from '~/constants/colors'

test('maps text and list attributes for the settings page', () => {
  const result = mapAttributesPage([
    {
      color: COLORS.blue,
      id: 2,
      listValues: [],
      name: 'Reference',
      type: 0,
    },
    {
      color: COLORS.green,
      id: 3,
      listValues: [{ id: 4, name: 'High' }],
      name: 'Priority',
      type: 1,
    },
  ])

  assert.deepEqual(result.AttributesPage.attributes, [
    {
      color: COLORS.blue,
      id: '2',
      name: 'Reference',
      type: 'text',
    },
    {
      color: COLORS.green,
      id: '3',
      name: 'Priority',
      type: 'list',
    },
  ])
})
