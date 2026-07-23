import { assert, test, vi } from 'vitest'

import { createApiClient } from '#infrastructure/api/client'
import { createAppLayoutDeps } from '~/sections/common/app-layout/AppLayout.deps.impl'

test('loads the requested organization layout', async () => {
  const fetch = vi.fn<typeof globalThis.fetch>(async (input) => {
    const path = new URL(input instanceof Request ? input.url : String(input)).pathname
    switch (path) {
      case '/api/organizations/current':
        return Response.json({
          canCreateSpaces: true,
          canManage: true,
          canManageAttributes: true,
          canMassMove: false,
          color: '#123',
          id: 1,
          name: 'Acme',
        })
      case '/api/organizations':
        return Response.json([
          {
            canUpdate: true,
            id: 1,
            name: 'Acme',
            slug: 'acme',
            slugPostfix: 'AB12',
          },
        ])
      case '/api/user':
        return Response.json({
          color: '#456',
          firstName: 'Ada',
          initials: 'AL',
          lastName: 'Lovelace',
        })
      case '/api/spaces':
        return Response.json([{ color: '#789', id: 2, key: 'DEV', name: 'Development' }])
      default:
        return new Response(null, { status: 404 })
    }
  })
  const deps = createAppLayoutDeps(createApiClient({ baseUrl: 'https://api.test', fetch }))

  assert.deepEqual(await deps.view({ organizationKey: 'acme-AB12' }), {
    ok: true,
    value: {
      organization: {
        canCreateSpaces: true,
        canManage: true,
        canManageAttributes: true,
        canMassMove: false,
        canUpdate: true,
        color: '#123',
        id: '1',
        initial: 'A',
        name: 'Acme',
      },
      spaces: [{ color: '#789', id: '2', key: 'DEV', name: 'Development' }],
      user: { color: '#456', initials: 'AL', name: 'Ada Lovelace' },
    },
  })
})
