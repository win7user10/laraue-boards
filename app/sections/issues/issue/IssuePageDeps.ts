import type { IssueDetailsDeps } from '~/components/issues/issue-details/IssueDetailsDeps'
import type { AddIssueAttachments } from '~/sections/issues/issue/deps/addIssueAttachments'
import type { DeleteIssue } from '~/sections/issues/issue/deps/deleteIssue'
import type { MoveIssue } from '~/sections/issues/issue/deps/moveIssue'
import type { UpdateIssue } from '~/sections/issues/issue/deps/updateIssue'
import type { ViewIssuePage } from '~/sections/issues/issue/deps/viewIssuePage'

export type IssuePageDeps = {
  addIssueAttachments: AddIssueAttachments
  deleteIssue: DeleteIssue
  issueDetails: IssueDetailsDeps
  moveIssue: MoveIssue
  updateIssue: UpdateIssue
  viewIssuePage: ViewIssuePage
}
