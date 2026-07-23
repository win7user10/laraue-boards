import { assert, test } from 'vitest'

import { createApiClient } from '#infrastructure/api/client'
import { createSpaceSettingsPageDeps } from '~/sections/spaces/space-settings/SpaceSettingsPage.deps.impl'

test('maps space settings data', async () => {
  const deps = createSpaceSettingsPageDeps(
    createApiClient({
      baseUrl: 'https://api.test',
      fetch: async (input) => {
        const path = new URL(input instanceof Request ? input.url : String(input)).pathname
        return path === '/api/spaces'
          ? Response.json([
              {
                color: '#fff',
                id: 4,
                key: 'product',
                name: 'Product',
              },
            ])
          : Response.json({ canDelete: true, canUpdate: false })
      },
    }),
  )

  assert.deepEqual(await deps.view({ spaceKey: 'product' }), {
    ok: true,
    value: {
      canDelete: true,
      canUpdate: false,
      color: '#fff',
      id: '4',
      name: 'Product',
      spaceKey: 'product',
    },
  })
})
