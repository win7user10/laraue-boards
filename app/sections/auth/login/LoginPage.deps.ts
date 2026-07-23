import type { Result } from '~/utils/actionResult'

export type TelegramUser = {
  auth_date: number
  first_name: string
  hash: string
  id: number
  last_name?: string
  photo_url?: string
  username?: string
}

export type LoginFailure = { type: 'invalidTelegramData' } | { type: 'temporarilyUnavailable' }

export type LoginPageDeps = {
  loginViaTelegramMiniApp: () => Promise<Result<boolean, LoginFailure>>
  loginViaTelegramWidget: (input: TelegramUser) => Promise<Result<void, LoginFailure>>
}
