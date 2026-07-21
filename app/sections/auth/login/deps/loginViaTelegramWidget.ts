export type LoginViaTelegramWidgetInput = {
  auth_date: number
  first_name: string
  hash: string
  id: number
  last_name?: string
  photo_url?: string
  username?: string
}

type LoginViaTelegramWidgetResult = null

type LoginViaTelegramWidgetError =
  | 'InvalidTelegramData'
  | 'TemporarilyUnavailable'

export type LoginViaTelegramWidget = (
  input: LoginViaTelegramWidgetInput,
) => Promise<
  ActionResult<LoginViaTelegramWidgetResult, LoginViaTelegramWidgetError>
>
