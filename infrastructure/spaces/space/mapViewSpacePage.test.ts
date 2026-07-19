import { assert, test } from 'vitest'

import { mapViewSpacePage } from './mapViewSpacePage'

test('maps the default board to the backlog destination', () => {
  const result = mapViewSpacePage(
    '2',
    { color: '#123456', id: 2, isDefault: false, key: 'WEB', name: 'Web' },
    { canCreateEpics: true, canDelete: true, canUpdate: true },
    [
      {
        color: null,
        columns: [{ color: '#111111', count: 2, id: 1, name: 'Inbox' }],
        id: 10,
        isDefault: true,
        name: 'Default',
        touchedAt: '2026-01-01T00:00:00Z',
      },
      {
        color: '#abcdef',
        columns: [{ color: '#222222', count: 3, id: 2, name: 'Done' }],
        id: 11,
        isDefault: false,
        name: 'Launch',
        touchedAt: '2026-01-01T00:00:00Z',
      },
    ],
  )

  assert.deepEqual(
    result.SpacePage.boards.map(({ id, kind, name }) => ({ id, kind, name })),
    [
      { id: '10', kind: 'backlog', name: 'Backlog' },
      { id: '11', kind: 'board', name: 'Launch' },
    ],
  )

  assert.equal(result.SpacePage.boards[0]?.issueCount, 2)
  assert.equal(result.SpacePage.boards[1]?.issueCount, 3)
})
