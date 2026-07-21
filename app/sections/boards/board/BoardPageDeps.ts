import type { IssueDialogDeps } from '~/sections/boards/board/components/IssueDialog/IssueDialogDeps'
import type { LoadMoreBoardIssues } from '~/sections/boards/board/deps/loadMoreBoardIssues'
import type { MoveBoardIssue } from '~/sections/boards/board/deps/moveBoardIssue'
import type { MoveIssueToBacklog } from '~/sections/boards/board/deps/moveIssueToBacklog'
import type { SearchBoardIssues } from '~/sections/boards/board/deps/searchBoardIssues'
import type { ViewBoardPage } from '~/sections/boards/board/deps/viewBoardPage'

export type BoardPageDeps = {
  issueDialog: IssueDialogDeps
  loadMoreBoardIssues: LoadMoreBoardIssues
  moveBoardIssue: MoveBoardIssue
  moveIssueToBacklog: MoveIssueToBacklog
  searchBoardIssues: SearchBoardIssues
  viewBoardPage: ViewBoardPage
}
