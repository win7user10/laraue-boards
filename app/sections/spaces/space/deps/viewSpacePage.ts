import type { SpacePageViewModel } from '~/sections/spaces/space/SpacePage.vue'

export type ViewSpacePageResult = { SpacePage: SpacePageViewModel }
type ViewSpacePageError =
  | 'AccessDenied'
  | 'SpaceNotFound'
  | 'TemporarilyUnavailable'

export type ViewSpacePage = (input: {
  spaceKey: string
}) => Promise<ActionResult<ViewSpacePageResult, ViewSpacePageError>>
