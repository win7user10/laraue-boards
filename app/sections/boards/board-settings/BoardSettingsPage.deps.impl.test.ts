import { assert, test, vi } from 'vitest'

import { createApiClient } from '#infrastructure/api/client'
import { createBoardSettingsPageDeps } from '~/sections/boards/board-settings/BoardSettingsPage.deps.impl'

test('saves board and column changes', async () => {
  const requests: Request[] = []
  const fetch = vi.fn<typeof globalThis.fetch>(async (input) => {
    const request = input as Request
    requests.push(request)
    const path = new URL(request.url).pathname
    return request.method === 'POST' && path === '/api/statuses'
      ? Response.json(9)
      : new Response(null, { status: 200 })
  })
  const deps = createBoardSettingsPageDeps(createApiClient({ baseUrl: 'https://api.test', fetch }))

  const result = await deps.save({
    boardId: '7',
    color: '#111',
    columns: [
      { color: '#222', id: '2', name: 'Doing' },
      { color: '#444', id: null, name: 'Done' },
    ],
    name: 'Roadmap',
    originalColumns: [
      { color: '#000', id: '2', name: 'Todo' },
      { color: '#333', id: '3', name: 'Later' },
    ],
  })

  assert.deepEqual(result, { ok: true, value: null })
  assert.deepEqual(
    requests.map((request) => [request.method, new URL(request.url).pathname]),
    [
      ['PUT', '/api/epics/7'],
      ['POST', '/api/statuses'],
      ['PUT', '/api/statuses/2'],
      ['DELETE', '/api/statuses/3'],
      ['POST', '/api/epics/7/reorder-statuses'],
    ],
  )
  assert.deepEqual(await requests[4]!.json(), { 2: 1, 9: 2 })
})
