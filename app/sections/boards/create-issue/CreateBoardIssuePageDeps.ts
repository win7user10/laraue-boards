import type { AddIssueAttachments } from '~/sections/boards/create-issue/deps/addIssueAttachments'
import type { CreateBoardIssue } from '~/sections/boards/create-issue/deps/createBoardIssue'
import type { LoadCreateBoardIssueAssignees } from '~/sections/boards/create-issue/deps/loadCreateBoardIssueAssignees'
import type { ViewCreateBoardIssuePage } from '~/sections/boards/create-issue/deps/viewCreateBoardIssuePage'

export type CreateBoardIssuePageDeps = {
  addIssueAttachments: AddIssueAttachments
  createBoardIssue: CreateBoardIssue
  loadCreateBoardIssueAssignees: LoadCreateBoardIssueAssignees
  viewCreateBoardIssuePage: ViewCreateBoardIssuePage
}
