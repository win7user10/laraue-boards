import assert from 'node:assert/strict'

import { afterEach, test, vi } from 'vitest'

import { err, ok } from '../../../app/utils/actionResult'
import { createApiClient } from '../../api/client'
import { openApiSelectOrganization } from '../../organizations/select-organization/openApiSelectOrganization'
import { openApiLoginViaTelegramMiniApp } from './openApiLoginViaTelegramMiniApp'
import { openApiLoginViaTelegramWidget } from './openApiLoginViaTelegramWidget'

afterEach(() => vi.unstubAllGlobals())

test('uses Telegram auth data and forwards scoped bearer tokens', async () => {
  const tokens = new Map<string, string>()
  const requests: {
    authorization: null | string
    body: string
    url: string
  }[] = []
  vi.stubGlobal('err', err)
  vi.stubGlobal('ok', ok)
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => tokens.get(key) ?? null,
    removeItem: (key: string) => tokens.delete(key),
    setItem: (key: string, value: string) => tokens.set(key, value),
  })
  vi.stubGlobal(
    'fetch',
    async (input: Request | string | URL, init?: RequestInit) => {
      const request =
        input instanceof Request ? input : new Request(input, init)
      requests.push({
        authorization: request.headers.get('Authorization'),
        body: await request.clone().text(),
        url: request.url,
      })
      return new Response(
        request.url.endsWith('/api/organizations/login')
          ? 'organization-token'
          : request.url.endsWith('/api/organizations')
            ? '[]'
            : request.url.endsWith('/api/organizations/current')
              ? '{}'
              : 'user-token',
        { status: 200 },
      )
    },
  )
  vi.stubGlobal('Telegram', { WebApp: { initData: '' } })

  assert.deepEqual(
    await openApiLoginViaTelegramMiniApp({
      baseUrl: 'https://api.example',
    })(),
    { ok: true, value: null },
  )

  const devLogin = openApiLoginViaTelegramMiniApp({
    baseUrl: 'https://api.example',
    testInitData: 'dev-init-data',
  })
  assert.deepEqual(await devLogin(), {
    ok: true,
    value: { authenticated: true },
  })
  assert.deepEqual(JSON.parse(requests[0]?.body ?? ''), {
    initData: 'dev-init-data',
  })

  vi.stubGlobal('Telegram', { WebApp: { initData: 'real-init-data' } })
  const miniAppLogin = openApiLoginViaTelegramMiniApp({
    baseUrl: 'https://api.example',
  })
  assert.deepEqual(await miniAppLogin(), {
    ok: true,
    value: { authenticated: true },
  })
  assert.deepEqual(JSON.parse(requests[1]?.body ?? ''), {
    initData: 'real-init-data',
  })

  const telegramUser = {
    auth_date: 123,
    first_name: 'Ada',
    hash: 'signed',
    id: 42,
  }
  assert.deepEqual(
    await openApiLoginViaTelegramWidget('https://api.example')(telegramUser),
    { ok: true, value: null },
  )
  assert.equal(requests[2]?.url, 'https://api.example/api/user/auth')
  assert.deepEqual(JSON.parse(requests[2]?.body ?? ''), telegramUser)

  await createApiClient('https://api.example').GET('/api/organizations')
  assert.equal(requests[3]?.authorization, 'Bearer user-token')

  tokens.set('organization_bearer', 'stale-organization-token')
  assert.deepEqual(
    await openApiSelectOrganization('https://api.example')({
      organizationId: '7',
    }),
    { ok: true, value: null },
  )
  assert.equal(requests[4]?.authorization, 'Bearer user-token')
  await createApiClient('https://api.example').GET('/api/organizations/current')
  assert.equal(requests[5]?.authorization, 'Bearer organization-token')
})
