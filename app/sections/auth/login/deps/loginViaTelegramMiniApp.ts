type LoginViaTelegramMiniAppResult = null | { authenticated: true }

type LoginViaTelegramMiniAppError =
  | 'InvalidTelegramData'
  | 'TemporarilyUnavailable'

export type LoginViaTelegramMiniApp = () => Promise<
  ActionResult<LoginViaTelegramMiniAppResult, LoginViaTelegramMiniAppError>
>
