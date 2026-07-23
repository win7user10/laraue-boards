import { assert, afterEach, test, vi } from 'vitest'

import { createApiClient } from '#infrastructure/api/client'
import { createLoginPageDeps } from '~/sections/auth/login/LoginPage.deps.impl'
import { err, ok } from '~/utils/actionResult'

afterEach(() => vi.unstubAllGlobals())

test('maps Telegram login requests', async () => {
  const requests: Request[] = []
  vi.stubGlobal('err', err)
  vi.stubGlobal('ok', ok)
  vi.stubGlobal(
    'fetch',
    async (input: Request | string | URL, init?: RequestInit) => {
      const request =
        input instanceof Request ? input : new Request(input, init)
      requests.push(request)
      return new Response('user-token', { status: 200 })
    },
  )
  vi.stubGlobal('Telegram', { WebApp: { initData: '' } })

  const client = createApiClient({ baseUrl: 'https://api.example' })
  assert.deepEqual(
    await createLoginPageDeps(client).loginViaTelegramMiniApp(),
    { ok: true, value: false },
  )

  const deps = createLoginPageDeps(client, 'dev-init-data')
  assert.deepEqual(await deps.loginViaTelegramMiniApp(), {
    ok: true,
    value: true,
  })
  assert.deepEqual(JSON.parse(await requests[0]!.clone().text()), {
    initData: 'dev-init-data',
  })

  const telegramUser = {
    auth_date: 123,
    first_name: 'Ada',
    hash: 'signed',
    id: 42,
  }
  assert.deepEqual(await deps.loginViaTelegramWidget(telegramUser), {
    ok: true,
    value: undefined,
  })
  assert.equal(requests[1]?.url, 'https://api.example/api/user/auth')
  assert.deepEqual(JSON.parse(await requests[1]!.clone().text()), telegramUser)
})
