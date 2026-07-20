import type { DeleteSpace } from '~/sections/spaces/space-settings/deps/deleteSpace'
import type { UpdateSpace } from '~/sections/spaces/space-settings/deps/updateSpace'
import type { ViewSpaceSettingsPage } from '~/sections/spaces/space-settings/deps/viewSpaceSettingsPage'
export type SpaceSettingsPageDeps = {
  deleteSpace: DeleteSpace
  updateSpace: UpdateSpace
  viewSpaceSettingsPage: ViewSpaceSettingsPage
}
