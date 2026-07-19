import type { BoardSettingsPageViewModel } from '../view/BoardSettingsPage.vue'
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
