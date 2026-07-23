import { assert, test } from 'vitest'

import { createApiClient } from '#infrastructure/api/client'

import { createSpaceSelectDeps } from '.'

test('maps space options', async () => {
  const client = createApiClient({
    baseUrl: 'https://api.test',
    fetch: async () => Response.json([{ id: 2, name: 'Product' }]),
  })

  assert.deepEqual(await createSpaceSelectDeps(client).loadSpaces({}), {
    ok: true,
    value: [{ label: 'Product', value: '2' }],
  })
})
