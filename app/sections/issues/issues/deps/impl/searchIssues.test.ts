import { assert, test } from 'vitest'

import { createApiClient } from '#infrastructure/api/client'

import { createSearchIssues } from './searchIssues'

test('maps searched issues', async () => {
  const client = createApiClient({
    baseUrl: 'https://api.test',
    fetch: async () =>
      Response.json({
        data: [
          {
            assignee: 'Ada',
            assigneeColor: '#111',
            assigneeInitial: 'A',
            canEdit: true,
            content: 'Fix search',
            epic: { color: '#222', name: 'Roadmap' },
            key: 'ISS-1',
            space: { color: '#333', name: 'Product' },
            status: { color: '#444', name: 'Todo' },
          },
        ],
        hasNextPage: false,
      }),
  })

  const result = await createSearchIssues(client)({
    filters: [],
    page: 1,
    search: 'search',
    spaceIds: [],
  })

  assert(result.ok)
  assert.equal(result.value.issues[0]?.issueKey, 'ISS-1')
  assert.equal(result.value.issues[0]?.spaceName, 'Product')
})
