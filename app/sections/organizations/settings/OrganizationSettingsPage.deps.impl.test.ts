import { assert, test, vi } from 'vitest'

import { createApiClient } from '#infrastructure/api/client'
import { DEFAULT_COLOR } from '~/constants/colors'
import { createOrganizationSettingsPageDeps } from '~/sections/organizations/settings/OrganizationSettingsPage.deps.impl'
import { ok } from '~/utils/actionResult'

test('maps API responses to organization settings data', async () => {
  const fetch = vi.fn<typeof globalThis.fetch>(async (input) => {
    const url = input instanceof Request ? input.url : String(input)
    const body = url.endsWith('/current')
      ? {
          canCreateSpaces: true,
          canManage: true,
          canManageAttributes: true,
          canMassMove: true,
          color: null,
          id: 7,
          name: 'Acme',
          slug: 'acme',
          slugPostfix: '42',
        }
      : [
          {
            canCreateSpaces: true,
            canDelete: false,
            canUpdate: true,
            color: null,
            id: 7,
            isPersonal: false,
            name: 'Acme',
            slug: 'acme',
            slugPostfix: '42',
          },
        ]

    return new Response(JSON.stringify(body), {
      headers: { 'content-type': 'application/json' },
      status: 200,
    })
  })
  const deps = createOrganizationSettingsPageDeps(
    createApiClient({ baseUrl: 'https://api.test', fetch }),
  )

  const result = await deps.view({})

  assert.deepEqual(
    result,
    ok({
      canUpdate: true,
      color: DEFAULT_COLOR,
      id: '7',
      name: 'Acme',
      slug: 'acme',
    }),
  )
  assert.equal(fetch.mock.calls.length, 2)
})
