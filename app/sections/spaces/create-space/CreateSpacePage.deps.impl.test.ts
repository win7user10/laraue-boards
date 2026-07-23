import { assert, test, vi } from 'vitest'

import { createApiClient } from '#infrastructure/api/client'
import { createCreateSpacePageDeps } from '~/sections/spaces/create-space/CreateSpacePage.deps.impl'

test('maps create space request and response', async () => {
  const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response('42'))
  const deps = createCreateSpacePageDeps(createApiClient({ baseUrl: 'https://api.test', fetch }))

  assert.deepEqual(await deps.create({ color: '#fff', key: 'product', name: 'Product' }), {
    ok: true,
    value: { spaceKey: 'product' },
  })
  const request = fetch.mock.calls[0]![0] as Request
  assert.deepEqual(await request.json(), {
    color: '#fff',
    key: 'product',
    name: 'Product',
  })
})
