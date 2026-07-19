import type { DeleteSpace } from './actions/deleteSpace'
import type { UpdateSpace } from './actions/updateSpace'
import type { ViewSpaceSettingsPage } from './actions/viewSpaceSettingsPage'
export type SpaceSettingsPageApplicationDeps = {
  deleteSpace: DeleteSpace
  updateSpace: UpdateSpace
  viewSpaceSettingsPage: ViewSpaceSettingsPage
}
