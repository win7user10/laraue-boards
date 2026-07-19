import assert from 'node:assert/strict'

import { test } from 'vitest'

import { mapDataMovementPage } from './mapDataMovementPage'

test('maps only movable boards and destination organizations', () => {
  const result = mapDataMovementPage(
    { id: 1 },
    [
      {
        canCreateSpaces: true,
        canDelete: false,
        canUpdate: false,
        color: null,
        id: 1,
        isPersonal: false,
        name: 'Current',
        slug: 'current',
        slugPostfix: '',
      },
      {
        canCreateSpaces: true,
        canDelete: false,
        canUpdate: false,
        color: null,
        id: 2,
        isPersonal: false,
        name: 'Target',
        slug: 'target',
        slugPostfix: '',
      },
      {
        canCreateSpaces: false,
        canDelete: false,
        canUpdate: false,
        color: null,
        id: 3,
        isPersonal: false,
        name: 'Read only',
        slug: 'read-only',
        slugPostfix: '',
      },
    ],
    [
      {
        color: '#111111',
        id: 10,
        isDefault: false,
        key: 'DEV',
        name: 'Development',
      },
    ],
    [{ color: '#111111', id: 10, name: 'Development' }],
    [
      [
        {
          color: '#222222',
          id: 20,
          isDefault: true,
          name: 'Backlog',
          touchedAt: '',
        },
        {
          color: '#333333',
          id: 21,
          isDefault: false,
          name: 'Board',
          touchedAt: '',
        },
      ],
    ],
  )

  assert.deepEqual(result.DataMovementPage.spaceOrganizations, [
    { label: 'Target', value: '2' },
  ])
  assert.deepEqual(result.DataMovementPage.spaces[0]?.boards, [
    { color: '#333333', id: '21', name: 'Board' },
  ])
})
