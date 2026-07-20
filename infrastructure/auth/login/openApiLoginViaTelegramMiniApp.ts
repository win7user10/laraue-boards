import { createApiClient } from '#infrastructure/api/client'
import type { LoginViaTelegramMiniApp } from '~/sections/auth/login/deps/loginViaTelegramMiniApp'

type TelegramWindow = typeof globalThis & {
  Telegram?: { WebApp?: { initData?: string } }
}

export const openApiLoginViaTelegramMiniApp =
  (params: {
    baseUrl: string
    testInitData?: string
  }): LoginViaTelegramMiniApp =>
  async () => {
    const initData =
      (globalThis as TelegramWindow).Telegram?.WebApp?.initData ||
      params.testInitData
    if (!initData) {
      return ok(null)
    }

    const client = createApiClient(params.baseUrl)
    try {
      const response = await client.POST('/api/user/auth-via-mini-app', {
        body: { initData },
        parseAs: 'text',
      })
      if (!response.response.ok) {
        return err('InvalidTelegramData')
      }
      return ok({ authenticated: true })
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
