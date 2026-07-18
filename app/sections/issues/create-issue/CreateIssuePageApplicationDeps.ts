import type { CreateIssue } from './actions/createIssue'
import type { LoadCreateIssueAssignees } from './actions/loadCreateIssueAssignees'
import type { LoadCreateIssueBoards } from './actions/loadCreateIssueBoards'
import type { LoadCreateIssueStatuses } from './actions/loadCreateIssueStatuses'
import type { ViewCreateIssuePage } from './actions/viewCreateIssuePage'

export type CreateIssuePageApplicationDeps = {
  createIssue: CreateIssue
  loadCreateIssueAssignees: LoadCreateIssueAssignees
  loadCreateIssueBoards: LoadCreateIssueBoards
  loadCreateIssueStatuses: LoadCreateIssueStatuses
  viewCreateIssuePage: ViewCreateIssuePage
}
