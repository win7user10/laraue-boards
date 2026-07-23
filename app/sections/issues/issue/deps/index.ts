import type { DeleteIssue } from './deleteIssue'
import type { LoadAssignees } from './loadAssignees'
import type { LoadMoveBoards } from './loadMoveBoards'
import type { LoadMoveSpaces } from './loadMoveSpaces'
import type { LoadStatuses } from './loadStatuses'
import type { MoveIssue } from './moveIssue'
import type { UpdateIssue } from './updateIssue'
import type { ViewIssue } from './viewIssue'

export type { UpdateIssueFailure } from './updateIssue'
export type { ViewIssueFailure } from './viewIssue'

export type IssuePageDeps = {
  deleteIssue: DeleteIssue
  loadAssignees: LoadAssignees
  loadMoveBoards: LoadMoveBoards
  loadMoveSpaces: LoadMoveSpaces
  loadStatuses: LoadStatuses
  moveIssue: MoveIssue
  updateIssue: UpdateIssue
  view: ViewIssue
}
