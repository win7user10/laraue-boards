import { assert, test } from 'vitest'

import { createApiClient } from '#infrastructure/api/client'
import { createCreateBoardIssuePageDeps } from '~/sections/boards/create-issue/CreateBoardIssuePage.deps.impl'

test('maps board issue page data', async () => {
  const deps = createCreateBoardIssuePageDeps(
    createApiClient({
      baseUrl: 'https://api.test',
      fetch: async (input) => {
        const path = new URL(
          input instanceof Request ? input.url : String(input),
        ).pathname
        return path === '/api/epics/7'
          ? Response.json({
              canCreateIssues: true,
              name: 'Roadmap',
              statuses: [
                { id: 2, name: 'Done', sortOrder: 2 },
                { id: 1, name: 'Todo', sortOrder: 1 },
              ],
            })
          : Response.json([])
      },
    }),
  )

  assert.deepEqual(await deps.view({ boardId: '7' }), {
    ok: true,
    value: {
      attributes: [],
      boardName: 'Roadmap',
      statuses: [
        { label: 'Todo', value: '1' },
        { label: 'Done', value: '2' },
      ],
      statusId: '1',
    },
  })
})
