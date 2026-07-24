import { assert, test } from 'vitest'

import { createApiClient } from '#infrastructure/api/client'

import { createViewIssues } from './viewIssues'

test('loads the initial issues page data', async () => {
  const client = createApiClient({
    baseUrl: 'https://api.test',
    fetch: async (input) => {
      const path = new URL((input as Request).url).pathname
      if (path === '/api/organizations/attributes') {
        return Response.json([])
      }
      if (path === '/api/spaces') {
        return Response.json([{ id: 2, name: 'Product' }])
      }
      return Response.json({ data: [], hasNextPage: false })
    },
  })

  assert.deepEqual(
    await createViewIssues(client)({
      attributeQuery: {},
      page: 1,
      search: '',
      spaceIds: [],
    }),
    {
      ok: true,
      value: {
        attributes: [],
        hasNextPage: false,
        issues: [],
        spaces: [{ label: 'Product', value: '2' }],
      },
    },
  )
})
