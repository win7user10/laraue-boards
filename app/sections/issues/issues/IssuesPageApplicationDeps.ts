import type { LoadIssuesMoveBoards } from './actions/loadIssuesMoveBoards'
import type { LoadIssuesMoveSpaces } from './actions/loadIssuesMoveSpaces'
import type { LoadIssuesMoveStatuses } from './actions/loadIssuesMoveStatuses'
import type { MoveIssues } from './actions/moveIssues'
import type { SearchIssues } from './actions/searchIssues'
import type { ViewIssuesPage } from './actions/viewIssuesPage'

export type IssuesPageApplicationDeps = {
  loadIssuesMoveBoards: LoadIssuesMoveBoards
  loadIssuesMoveSpaces: LoadIssuesMoveSpaces
  loadIssuesMoveStatuses: LoadIssuesMoveStatuses
  moveIssues: MoveIssues
  searchIssues: SearchIssues
  viewIssuesPage: ViewIssuesPage
}
