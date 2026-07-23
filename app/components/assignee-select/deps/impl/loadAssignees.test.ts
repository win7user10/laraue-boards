import { assert, test } from 'vitest'

import { createApiClient } from '#infrastructure/api/client'

import { createAssigneeSelectDeps } from '.'

test('maps assignee options', async () => {
  const client = createApiClient({
    baseUrl: 'https://api.test',
    fetch: async () =>
      Response.json([
        {
          color: '#123456',
          displayName: 'Ada Lovelace',
          initials: 'AL',
          userId: 'user-1',
        },
      ]),
  })

  assert.deepEqual(
    await createAssigneeSelectDeps(client).loadAssignees({
      spaceId: '2',
    }),
    {
      ok: true,
      value: [
        {
          color: '#123456',
          initials: 'AL',
          label: 'Ada Lovelace',
          value: 'user-1',
        },
      ],
    },
  )
})
