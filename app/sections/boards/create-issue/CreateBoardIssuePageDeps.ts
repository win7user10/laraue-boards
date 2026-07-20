import type { CreateBoardIssue } from '~/sections/boards/create-issue/deps/createBoardIssue'
import type { LoadCreateBoardIssueAssignees } from '~/sections/boards/create-issue/deps/loadCreateBoardIssueAssignees'
import type { ViewCreateBoardIssuePage } from '~/sections/boards/create-issue/deps/viewCreateBoardIssuePage'

export type CreateBoardIssuePageDeps = {
  createBoardIssue: CreateBoardIssue
  loadCreateBoardIssueAssignees: LoadCreateBoardIssueAssignees
  viewCreateBoardIssuePage: ViewCreateBoardIssuePage
}
