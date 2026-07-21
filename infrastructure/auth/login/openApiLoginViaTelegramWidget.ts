import { createApiClient } from '#infrastructure/api/client'
import type { LoginViaTelegramWidget } from '~/sections/auth/login/deps/loginViaTelegramWidget'

export const openApiLoginViaTelegramWidget =
  (baseUrl: string): LoginViaTelegramWidget =>
  async (input) => {
    const client = createApiClient(baseUrl)
    try {
      const response = await client.POST('/api/user/auth', {
        body: input,
        parseAs: 'text',
      })
      if (!response.response.ok) {
        return err('InvalidTelegramData')
      }
      return ok(null)
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
