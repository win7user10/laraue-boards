import type { CreateBacklogIssue } from './actions/createBacklogIssue'
import type { LoadCreateBacklogIssueAssignees } from './actions/loadCreateBacklogIssueAssignees'
import type { ViewCreateBacklogIssuePage } from './actions/viewCreateBacklogIssuePage'

export type CreateBacklogIssuePageApplicationDeps = {
  createBacklogIssue: CreateBacklogIssue
  loadCreateBacklogIssueAssignees: LoadCreateBacklogIssueAssignees
  viewCreateBacklogIssuePage: ViewCreateBacklogIssuePage
}
