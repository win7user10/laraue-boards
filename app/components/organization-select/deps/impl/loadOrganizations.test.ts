import { assert, test } from 'vitest'

import { createApiClient } from '#infrastructure/api/client'

import { createOrganizationSelectDeps } from '.'

test('maps organization options', async () => {
  const client = createApiClient({
    baseUrl: 'https://api.test',
    fetch: async () => Response.json([{ id: 1, name: 'Acme' }]),
  })

  assert.deepEqual(await createOrganizationSelectDeps(client).loadOrganizations(), {
    ok: true,
    value: [{ label: 'Acme', value: '1' }],
  })
})
