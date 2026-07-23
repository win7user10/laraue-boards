import { assert, test } from 'vitest'

import { createApiClient } from '#infrastructure/api/client'

import { createStatusSelectDeps } from '.'

test('sorts and maps status options', async () => {
  const client = createApiClient({
    baseUrl: 'https://api.test',
    fetch: async () =>
      Response.json({
        statuses: [
          { id: 5, name: 'Done', sortOrder: 2 },
          { id: 4, name: 'Todo', sortOrder: 1 },
        ],
      }),
  })

  assert.deepEqual(await createStatusSelectDeps(client).loadStatuses({ boardId: '3' }), {
    ok: true,
    value: [
      { label: 'Todo', value: '4' },
      { label: 'Done', value: '5' },
    ],
  })
})
