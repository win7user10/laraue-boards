import { assert, test } from 'vitest'

import { createApiClient } from '#infrastructure/api/client'
import { createCreateIssuePageDeps } from '~/sections/issues/create-issue/CreateIssuePage.deps.impl'

test('maps create issue page data and request', async () => {
  const requests: Request[] = []
  const client = createApiClient({
    baseUrl: 'https://api.test',
    fetch: async (input, init) => {
      const request = new Request(input, init)
      requests.push(request)
      const path = new URL(request.url).pathname
      if (path === '/api/spaces') {
        return Response.json([{ id: 7, name: 'Product' }])
      }
      if (path === '/api/organizations/attributes') {
        return Response.json([
          {
            color: '#fff',
            id: 3,
            listValues: [],
            name: 'Note',
            type: 0,
          },
        ])
      }
      if (path === '/api/issues') {
        return new Response('ISS-42')
      }
      throw new Error(`Unexpected request: ${path}`)
    },
  })
  const deps = createCreateIssuePageDeps(client)

  assert.deepEqual(await deps.view({}), {
    ok: true,
    value: {
      attributes: [{ color: '#fff', id: '3', name: 'Note', type: 'text' }],
      boardId: '',
      boards: [],
      spaceId: '7',
      spaces: [{ label: 'Product', value: '7' }],
      statuses: [],
      statusId: '',
    },
  })
  assert.deepEqual(
    await deps.create({
      assigneeId: '9',
      attributeValues: [{ attributeId: '3', type: 'text', value: 'Details' }],
      content: 'Issue',
      files: [],
      statusId: '5',
    }),
    { ok: true, value: { issueKey: 'ISS-42' } },
  )
  const form = await requests.at(-1)!.formData()
  assert.equal(form.get('AssigneeId'), '9')
  assert.equal(form.get('StatusId'), '5')
})
