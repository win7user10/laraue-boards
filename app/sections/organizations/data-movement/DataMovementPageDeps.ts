import type { LoadDataMovementSpaces } from '~/sections/organizations/data-movement/deps/loadDataMovementSpaces'
import type { MoveBoards } from '~/sections/organizations/data-movement/deps/moveBoards'
import type { MoveSpaces } from '~/sections/organizations/data-movement/deps/moveSpaces'
import type { ViewDataMovementPage } from '~/sections/organizations/data-movement/deps/viewDataMovementPage'

export type DataMovementPageDeps = {
  loadDataMovementSpaces: LoadDataMovementSpaces
  moveBoards: MoveBoards
  moveSpaces: MoveSpaces
  viewDataMovementPage: ViewDataMovementPage
}
