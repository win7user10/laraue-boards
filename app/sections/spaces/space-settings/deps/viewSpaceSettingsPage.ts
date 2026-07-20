import type { SpaceSettingsPageViewModel } from '~/sections/spaces/space-settings/components/SpaceSettingsContent.vue'
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
