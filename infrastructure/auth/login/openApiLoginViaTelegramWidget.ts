import type { LoginViaTelegramWidget } from '../../../app/sections/auth/login/actions/loginViaTelegramWidget'
import { createApiClient } from '../../api/client'

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
