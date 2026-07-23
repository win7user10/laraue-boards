import { assert, test } from 'vitest'

import { createApiClient } from '#infrastructure/api/client'

import { createBoardSelectDeps } from '.'

test('maps board options', async () => {
  const client = createApiClient({
    baseUrl: 'https://api.test',
    fetch: async () => Response.json([{ id: 3, name: 'Roadmap' }]),
  })

  assert.deepEqual(await createBoardSelectDeps(client).loadBoards({ spaceId: '2' }), {
    ok: true,
    value: [{ label: 'Roadmap', value: '3' }],
  })
})
