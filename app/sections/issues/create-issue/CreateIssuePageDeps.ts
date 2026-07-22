import type { CreateIssue } from '~/sections/issues/create-issue/deps/createIssue'
import type { LoadCreateIssueAssignees } from '~/sections/issues/create-issue/deps/loadCreateIssueAssignees'
import type { LoadCreateIssueBoards } from '~/sections/issues/create-issue/deps/loadCreateIssueBoards'
import type { LoadCreateIssueStatuses } from '~/sections/issues/create-issue/deps/loadCreateIssueStatuses'
import type { ViewCreateIssuePage } from '~/sections/issues/create-issue/deps/viewCreateIssuePage'

export type CreateIssuePageDeps = {
  createIssue: CreateIssue
  loadCreateIssueAssignees: LoadCreateIssueAssignees
  loadCreateIssueBoards: LoadCreateIssueBoards
  loadCreateIssueStatuses: LoadCreateIssueStatuses
  viewCreateIssuePage: ViewCreateIssuePage
}
