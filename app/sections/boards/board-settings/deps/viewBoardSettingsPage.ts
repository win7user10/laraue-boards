import type { BoardSettingsPageViewModel } from '~/sections/boards/board-settings/components/BoardSettingsContent.vue'
type ViewBoardSettingsPageResult = {
  BoardSettingsPage: BoardSettingsPageViewModel
}
type ViewBoardSettingsPageError =
  | 'AccessDenied'
  | 'BoardNotFound'
  | 'TemporarilyUnavailable'

export type ViewBoardSettingsPage = (input: {
  boardId: string
}) => Promise<
  ActionResult<ViewBoardSettingsPageResult, ViewBoardSettingsPageError>
>
