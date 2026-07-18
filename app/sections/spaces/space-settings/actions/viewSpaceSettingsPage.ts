import type { SpaceSettingsPageViewModel } from '../view/SpaceSettingsPage.vue'
type ViewSpaceSettingsPageResult = {
  SpaceSettingsPage: SpaceSettingsPageViewModel
}
type ViewSpaceSettingsPageError =
  | 'AccessDenied'
  | 'SpaceNotFound'
  | 'TemporarilyUnavailable'

export type ViewSpaceSettingsPage = (input: {
  spaceKey: string
}) => Promise<
  ActionResult<ViewSpaceSettingsPageResult, ViewSpaceSettingsPageError>
>
