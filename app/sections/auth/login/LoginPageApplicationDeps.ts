import type { LoginViaTelegramMiniApp } from './actions/loginViaTelegramMiniApp'
import type { LoginViaTelegramWidget } from './actions/loginViaTelegramWidget'

export type LoginPageApplicationDeps = {
  loginViaTelegramMiniApp: LoginViaTelegramMiniApp
  loginViaTelegramWidget: LoginViaTelegramWidget
}
