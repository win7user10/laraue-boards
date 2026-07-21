import type { CreateBoardColumn } from '~/sections/boards/board-settings/deps/createBoardColumn'
import type { DeleteBoard } from '~/sections/boards/board-settings/deps/deleteBoard'
import type { DeleteBoardColumn } from '~/sections/boards/board-settings/deps/deleteBoardColumn'
import type { ReorderBoardColumns } from '~/sections/boards/board-settings/deps/reorderBoardColumns'
import type { UpdateBoard } from '~/sections/boards/board-settings/deps/updateBoard'
import type { UpdateBoardColumn } from '~/sections/boards/board-settings/deps/updateBoardColumn'
import type { ViewBoardSettingsPage } from '~/sections/boards/board-settings/deps/viewBoardSettingsPage'
export type BoardSettingsPageDeps = {
  createBoardColumn: CreateBoardColumn
  deleteBoard: DeleteBoard
  deleteBoardColumn: DeleteBoardColumn
  reorderBoardColumns: ReorderBoardColumns
  updateBoard: UpdateBoard
  updateBoardColumn: UpdateBoardColumn
  viewBoardSettingsPage: ViewBoardSettingsPage
}
