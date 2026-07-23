import { assert, test, vi } from 'vitest'

import { createApiClient } from '#infrastructure/api/client'
import { createCreateOrganizationPageDeps } from '~/sections/organizations/create-organization/CreateOrganizationPage.deps.impl'

test('maps create organization request and response', async () => {
  const fetchMock = vi
    .fn<typeof globalThis.fetch>()
    .mockResolvedValue(Response.json({ id: 42, slug: 'acme', slugPostfix: 'ABC1' }))
  const deps = createCreateOrganizationPageDeps(
    createApiClient({ baseUrl: 'https://api.test', fetch: fetchMock }),
  )

  assert.deepEqual(await deps.create({ color: '#fff', name: 'Acme', slug: 'acme' }), {
    ok: true,
    value: { organizationId: '42' },
  })
  const request = fetchMock.mock.calls[0]![0] as Request
  assert.equal(request.url, 'https://api.test/api/organizations')
  assert.deepEqual(await request.json(), {
    color: '#fff',
    name: 'Acme',
    slug: 'acme',
  })
})
