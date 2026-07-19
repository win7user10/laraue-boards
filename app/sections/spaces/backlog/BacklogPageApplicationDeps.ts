import type { LoadBacklogMoveBoards } from './actions/loadBacklogMoveBoards'
import type { LoadBacklogMoveSpaces } from './actions/loadBacklogMoveSpaces'
import type { LoadBacklogMoveStatuses } from './actions/loadBacklogMoveStatuses'
import type { MoveBacklogIssues } from './actions/moveBacklogIssues'
import type { SearchBacklogIssues } from './actions/searchBacklogIssues'
import type { ViewBacklogPage } from './actions/viewBacklogPage'

export type BacklogPageApplicationDeps = {
  loadBacklogMoveBoards: LoadBacklogMoveBoards
  loadBacklogMoveSpaces: LoadBacklogMoveSpaces
  loadBacklogMoveStatuses: LoadBacklogMoveStatuses
  moveBacklogIssues: MoveBacklogIssues
  searchBacklogIssues: SearchBacklogIssues
  viewBacklogPage: ViewBacklogPage
}
