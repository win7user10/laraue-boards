import { assert, test } from 'vitest'

import { createApiClient } from '#infrastructure/api/client'
import { createOrganizationPickerPageDeps } from '~/sections/organizations/select-organization/OrganizationPickerPage.deps.impl'

test('maps organizations and selects one', async () => {
  const requests: Request[] = []
  const client = createApiClient({
    baseUrl: 'https://api.test',
    fetch: async (request) => {
      const normalizedRequest = new Request(request)
      requests.push(normalizedRequest)
      return normalizedRequest.method === 'GET'
        ? Response.json([
            {
              color: null,
              id: 42,
              isPersonal: false,
              name: 'Laraue',
              slug: 'laraue',
              slugPostfix: 'HF2P0',
            },
          ])
        : new Response(null, { status: 204 })
    },
  })
  const deps = createOrganizationPickerPageDeps(client)

  const view = await deps.view({})
  const select = await deps.select({ organizationId: '42' })

  assert.deepEqual(view, {
    ok: true,
    value: [
      {
        color: '#4774d4',
        description: 'Team organization',
        id: '42',
        initial: 'L',
        key: 'laraue-HF2P0',
        name: 'Laraue',
      },
    ],
  })
  assert.deepEqual(select, { ok: true, value: null })
  assert.deepEqual(await requests[1]!.json(), { organizationId: '42' })
})
