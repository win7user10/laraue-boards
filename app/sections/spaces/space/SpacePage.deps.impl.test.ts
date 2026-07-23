import { assert, test } from 'vitest'

import { createApiClient } from '#infrastructure/api/client'
import { COLORS } from '~/constants/colors'
import { createSpacePageDeps } from '~/sections/spaces/space/SpacePage.deps.impl'

test('maps the space and its board summaries', async () => {
  const deps = createSpacePageDeps(
    createApiClient({
      baseUrl: 'https://api.test',
      fetch: async (input) => {
        const path = new URL(input instanceof Request ? input.url : String(input)).pathname
        if (path === '/api/spaces') {
          return Response.json([{ color: COLORS.blue, id: 2, key: 'WEB', name: 'Web' }])
        }
        if (path === '/api/spaces/2') {
          return Response.json({
            canCreateEpics: true,
            canDelete: true,
            canUpdate: true,
          })
        }
        return Response.json([
          {
            color: null,
            columns: [{ color: COLORS.gray, count: 2, id: 1, name: 'Inbox' }],
            id: 10,
            isDefault: true,
            name: 'Default',
            touchedAt: '2026-01-01T00:00:00Z',
          },
        ])
      },
    }),
  )

  const result = await deps.view({ spaceKey: 'WEB' })

  assert.equal(result.ok && result.value.boards[0]?.kind, 'backlog')
  assert.equal(result.ok && result.value.boards[0]?.issueCount, 2)
  assert.equal(result.ok && result.value.boards[0]?.name, 'Backlog')
})
