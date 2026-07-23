import { assert, test, vi } from 'vitest'

import { createApiClient } from '#infrastructure/api/client'
import { COLORS } from '~/constants/colors'
import { createDataMovementPageDeps } from '~/sections/organizations/data-movement/DataMovementPage.deps.impl'
import { ok } from '~/utils/actionResult'

test('maps movable spaces, boards, and organizations', async () => {
  const fetch = vi.fn<typeof globalThis.fetch>(async (input) => {
    const path = new URL(input instanceof Request ? input.url : String(input)).pathname
    const body = path.endsWith('/organizations/current')
      ? { canMassMove: true, id: 1 }
      : path.endsWith('/organizations')
        ? [
            { canCreateSpaces: true, id: 1, name: 'Current' },
            { canCreateSpaces: true, id: 2, name: 'Target' },
            { canCreateSpaces: false, id: 3, name: 'Read only' },
          ]
        : path.endsWith('/spaces')
          ? [
              {
                color: COLORS.gray,
                id: 10,
                isDefault: false,
                name: 'Development',
              },
            ]
          : path.endsWith('/epics')
            ? [
                {
                  color: COLORS.amber,
                  id: 20,
                  isDefault: true,
                  name: 'Backlog',
                },
                {
                  color: COLORS.coral,
                  id: 21,
                  isDefault: false,
                  name: 'Board',
                },
              ]
            : [{ color: COLORS.gray, id: 10, name: 'Development' }]

    return new Response(JSON.stringify(body), {
      headers: { 'content-type': 'application/json' },
      status: 200,
    })
  })
  const deps = createDataMovementPageDeps(createApiClient({ baseUrl: 'https://api.test', fetch }))

  const result = await deps.view({})

  assert.deepEqual(
    result,
    ok({
      currentOrganizationId: '1',
      currentSpaces: [{ label: 'Development', value: '10' }],
      organizations: [
        { label: 'Current', value: '1' },
        { label: 'Target', value: '2' },
        { label: 'Read only', value: '3' },
      ],
      spaceOrganizations: [{ label: 'Target', value: '2' }],
      spaces: [
        {
          boards: [{ color: COLORS.coral, id: '21', name: 'Board' }],
          color: COLORS.gray,
          id: '10',
          isDefault: false,
          name: 'Development',
        },
      ],
    }),
  )
})
