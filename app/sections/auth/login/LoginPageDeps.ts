import type { LoginViaTelegramMiniApp } from '~/sections/auth/login/deps/loginViaTelegramMiniApp'
import type { LoginViaTelegramWidget } from '~/sections/auth/login/deps/loginViaTelegramWidget'

export type LoginPageDeps = {
  loginViaTelegramMiniApp: LoginViaTelegramMiniApp
  loginViaTelegramWidget: LoginViaTelegramWidget
}
