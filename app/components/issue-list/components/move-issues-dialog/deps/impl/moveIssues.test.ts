import { assert, test } from 'vitest'

import { createApiClient } from '#infrastructure/api/client'

import { createMoveIssues } from './moveIssues'

test('moves every selected issue', async () => {
  const requests: Request[] = []
  const client = createApiClient({
    baseUrl: 'https://api.test',
    fetch: async (input) => {
      requests.push(input as Request)
      return new Response(null, { status: 204 })
    },
  })

  assert.deepEqual(
    await createMoveIssues(client)({
      issueKeys: ['ISS-1', 'ISS-2'],
      statusId: '3',
    }),
    { ok: true, value: undefined },
  )
  assert.deepEqual(
    requests.map((request) => new URL(request.url).pathname),
    ['/api/movement/issue/ISS-1/move-to-status/3', '/api/movement/issue/ISS-2/move-to-status/3'],
  )
})
