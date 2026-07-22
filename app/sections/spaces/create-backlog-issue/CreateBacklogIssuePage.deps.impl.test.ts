import { assert, test } from 'vitest'

import { createApiClient } from '#infrastructure/api/client'
import { createCreateBacklogIssuePageDeps } from '~/sections/spaces/create-backlog-issue/CreateBacklogIssuePage.deps.impl'

test('maps backlog issue page data', async () => {
  const deps = createCreateBacklogIssuePageDeps(
    createApiClient({
      baseUrl: 'https://api.test',
      fetch: async (input) => {
        const path = new URL(
          input instanceof Request ? input.url : String(input),
        ).pathname
        if (path === '/api/spaces') {
          return Response.json([
            {
              id: 4,
              key: 'product-ABCD',
              name: 'Product',
            },
          ])
        }
        if (path === '/api/spaces/4/epics') {
          return Response.json([{ id: 8, isDefault: true, name: 'Backlog' }])
        }
        if (path === '/api/epics/8') {
          return Response.json({
            canCreateIssues: true,
            statuses: [{ id: 3, name: 'Open', sortOrder: 1 }],
          })
        }
        return Response.json([])
      },
    }),
  )

  assert.deepEqual(await deps.view({ spaceKey: 'product-ABCD' }), {
    ok: true,
    value: {
      attributes: [],
      boardName: 'Backlog',
      spaceId: '4',
      statusId: '3',
    },
  })
})
