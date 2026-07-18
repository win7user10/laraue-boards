import type { DeleteIssue } from './actions/deleteIssue'
import type { LoadIssueAssignees } from './actions/loadIssueAssignees'
import type { LoadIssueMoveBoards } from './actions/loadIssueMoveBoards'
import type { LoadIssueMoveSpaces } from './actions/loadIssueMoveSpaces'
import type { LoadIssueStatuses } from './actions/loadIssueStatuses'
import type { MoveIssue } from './actions/moveIssue'
import type { UpdateIssue } from './actions/updateIssue'
import type { ViewIssuePage } from './actions/viewIssuePage'

export type IssuePageApplicationDeps = {
  deleteIssue: DeleteIssue
  loadIssueAssignees: LoadIssueAssignees
  loadIssueMoveBoards: LoadIssueMoveBoards
  loadIssueMoveSpaces: LoadIssueMoveSpaces
  loadIssueStatuses: LoadIssueStatuses
  moveIssue: MoveIssue
  updateIssue: UpdateIssue
  viewIssuePage: ViewIssuePage
}
