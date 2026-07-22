import type { CreateBacklogIssue } from '~/sections/spaces/create-backlog-issue/deps/createBacklogIssue'
import type { LoadCreateBacklogIssueAssignees } from '~/sections/spaces/create-backlog-issue/deps/loadCreateBacklogIssueAssignees'
import type { ViewCreateBacklogIssuePage } from '~/sections/spaces/create-backlog-issue/deps/viewCreateBacklogIssuePage'

export type CreateBacklogIssuePageDeps = {
  createBacklogIssue: CreateBacklogIssue
  loadCreateBacklogIssueAssignees: LoadCreateBacklogIssueAssignees
  viewCreateBacklogIssuePage: ViewCreateBacklogIssuePage
}
