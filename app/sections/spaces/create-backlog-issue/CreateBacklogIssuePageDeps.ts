import type { AddIssueAttachments } from '~/sections/spaces/create-backlog-issue/deps/addIssueAttachments'
import type { CreateBacklogIssue } from '~/sections/spaces/create-backlog-issue/deps/createBacklogIssue'
import type { LoadCreateBacklogIssueAssignees } from '~/sections/spaces/create-backlog-issue/deps/loadCreateBacklogIssueAssignees'
import type { ViewCreateBacklogIssuePage } from '~/sections/spaces/create-backlog-issue/deps/viewCreateBacklogIssuePage'

export type CreateBacklogIssuePageDeps = {
  addIssueAttachments: AddIssueAttachments
  createBacklogIssue: CreateBacklogIssue
  loadCreateBacklogIssueAssignees: LoadCreateBacklogIssueAssignees
  viewCreateBacklogIssuePage: ViewCreateBacklogIssuePage
}
