import { assert, test, vi } from 'vitest'

import { createApiClient } from '#infrastructure/api/client'
import { createCreateBoardPageDeps } from '~/sections/boards/create-board/CreateBoardPage.deps.impl'

test('maps create board request and response', async () => {
  const fetch = vi.fn<typeof globalThis.fetch>(async (input) => {
    const path = new URL(input instanceof Request ? input.url : String(input)).pathname
    return path === '/api/spaces'
      ? Response.json([{ id: 4, key: 'product', name: 'Product' }])
      : new Response('7')
  })
  const deps = createCreateBoardPageDeps(createApiClient({ baseUrl: 'https://api.test', fetch }))

  assert.deepEqual(await deps.create({ color: '#fff', name: 'Roadmap', spaceKey: 'product' }), {
    ok: true,
    value: { boardId: '7' },
  })
  const request = fetch.mock.calls[1]![0] as Request
  assert.deepEqual(await request.json(), {
    color: '#fff',
    name: 'Roadmap',
    spaceId: 4,
  })
})
