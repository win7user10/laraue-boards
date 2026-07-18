import type { DeleteIssue } from './actions/deleteIssue'
import type { LoadIssueDialog } from './actions/loadIssueDialog'
import type { LoadIssueDialogAssignees } from './actions/loadIssueDialogAssignees'
import type { LoadIssueMoveBoards } from './actions/loadIssueMoveBoards'
import type { LoadIssueMoveSpaces } from './actions/loadIssueMoveSpaces'
import type { LoadIssueStatuses } from './actions/loadIssueStatuses'
import type { LoadMoreBoardIssues } from './actions/loadMoreBoardIssues'
import type { MoveBoardIssue } from './actions/moveBoardIssue'
import type { MoveIssueToBacklog } from './actions/moveIssueToBacklog'
import type { SearchBoardIssues } from './actions/searchBoardIssues'
import type { UpdateIssue } from './actions/updateIssue'
import type { ViewBoardPage } from './actions/viewBoardPage'

export type BoardPageApplicationDeps = {
  deleteIssue: DeleteIssue
  loadIssueDialog: LoadIssueDialog
  loadIssueDialogAssignees: LoadIssueDialogAssignees
  loadIssueMoveBoards: LoadIssueMoveBoards
  loadIssueMoveSpaces: LoadIssueMoveSpaces
  loadIssueStatuses: LoadIssueStatuses
  loadMoreBoardIssues: LoadMoreBoardIssues
  moveBoardIssue: MoveBoardIssue
  moveIssueToBacklog: MoveIssueToBacklog
  searchBoardIssues: SearchBoardIssues
  updateIssue: UpdateIssue
  viewBoardPage: ViewBoardPage
}
