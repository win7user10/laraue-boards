import type { LoadDataMovementSpaces } from './actions/loadDataMovementSpaces'
import type { MoveBoards } from './actions/moveBoards'
import type { MoveSpaces } from './actions/moveSpaces'
import type { ViewDataMovementPage } from './actions/viewDataMovementPage'

export type DataMovementPageApplicationDeps = {
  loadDataMovementSpaces: LoadDataMovementSpaces
  moveBoards: MoveBoards
  moveSpaces: MoveSpaces
  viewDataMovementPage: ViewDataMovementPage
}
