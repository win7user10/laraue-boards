import type { Logout } from './actions/logout'
import type { ViewAppLayout } from './actions/viewAppLayout'

export type AppLayoutApplicationDeps = {
  logout: Logout
  viewLayout: ViewAppLayout
}
