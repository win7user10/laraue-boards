import type { ApiClient } from '#infrastructure/api/client'
import type {
  LoginFailure,
  LoginPageDeps,
} from '~/sections/auth/login/LoginPage.deps'
import { err, ok } from '~/utils/actionResult'

type TelegramWindow = typeof globalThis & {
  Telegram?: { WebApp?: { initData?: string } }
}

const mapFailure = (status: number): LoginFailure | undefined => {
  if (status === 400 || status === 401 || status === 403) {
    return { type: 'invalidTelegramData' }
  }
  if (status >= 500) {
    return { type: 'temporarilyUnavailable' }
  }
}

const failureFrom = (status: number): LoginFailure => {
  const failure = mapFailure(status)
  if (failure) {
    return failure
  }
  throw new Error(`Unrecognized login response: ${status}`)
}

export function createLoginPageDeps(
  client: ApiClient,
  testInitData?: string,
): LoginPageDeps {
  return {
    async loginViaTelegramMiniApp() {
      const initData =
        (globalThis as TelegramWindow).Telegram?.WebApp?.initData ||
        testInitData
      if (!initData) {
        return ok(false)
      }

      const response = await client.POST('/api/user/auth-via-mini-app', {
        body: { initData },
        parseAs: 'text',
      })
      return 'data' in response
        ? ok(true)
        : err(failureFrom(response.response.status))
    },

    async loginViaTelegramWidget(input) {
      const response = await client.POST('/api/user/auth', {
        body: input,
        parseAs: 'text',
      })
      return 'data' in response
        ? ok(undefined)
        : err(failureFrom(response.response.status))
    },
  }
}
