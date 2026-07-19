import type { CreateBoardColumn } from './actions/createBoardColumn'
import type { DeleteBoard } from './actions/deleteBoard'
import type { DeleteBoardColumn } from './actions/deleteBoardColumn'
import type { ReorderBoardColumns } from './actions/reorderBoardColumns'
import type { UpdateBoard } from './actions/updateBoard'
import type { UpdateBoardColumn } from './actions/updateBoardColumn'
import type { ViewBoardSettingsPage } from './actions/viewBoardSettingsPage'
export type BoardSettingsPageApplicationDeps = {
  createBoardColumn: CreateBoardColumn
  deleteBoard: DeleteBoard
  deleteBoardColumn: DeleteBoardColumn
  reorderBoardColumns: ReorderBoardColumns
  updateBoard: UpdateBoard
  updateBoardColumn: UpdateBoardColumn
  viewBoardSettingsPage: ViewBoardSettingsPage
}
