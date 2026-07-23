import { assert, test } from 'vitest'

import { createApiClient } from '#infrastructure/api/client'

import { createSaveIssue } from './saveIssue'

test('reports a partial save when update succeeds but move fails', async () => {
  const client = createApiClient({
    baseUrl: 'https://api.test',
    fetch: async (input) => {
      const request = input as Request
      return request.method === 'PUT'
        ? new Response(null, { status: 204 })
        : new Response(null, { status: 503 })
    },
  })

  const result = await createSaveIssue(client)({
    assigneeId: '4',
    attributeValues: [],
    boardId: '8',
    content: 'Updated issue',
    files: [],
    issueKey: 'ISS-42',
    previousBoardId: '7',
    previousStatusId: '2',
    removeAttachmentIds: [],
    statusId: '3',
  })

  assert.deepEqual(result, {
    error: {
      issue: {
        boardId: '7',
        complete: false,
        content: 'Updated issue',
        issueKey: 'ISS-42',
        previousBoardId: '7',
        previousStatusId: '2',
        statusId: '2',
      },
      type: 'partiallySaved',
    },
    ok: false,
  })
})
