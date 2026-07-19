import type { CreateBoardIssue } from './actions/createBoardIssue'
import type { LoadCreateBoardIssueAssignees } from './actions/loadCreateBoardIssueAssignees'
import type { ViewCreateBoardIssuePage } from './actions/viewCreateBoardIssuePage'

export type CreateBoardIssuePageApplicationDeps = {
  createBoardIssue: CreateBoardIssue
  loadCreateBoardIssueAssignees: LoadCreateBoardIssueAssignees
  viewCreateBoardIssuePage: ViewCreateBoardIssuePage
}
