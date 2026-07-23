import type { IssueDetailsDeps } from '~/components/issues/issue-details/deps'

import type { DeleteIssue } from './deleteIssue'
import type { ViewIssue } from './viewIssue'

export type { ViewIssueFailure } from './viewIssue'

export type IssuePageDeps = {
  deleteIssue: DeleteIssue
  issueDetails: IssueDetailsDeps
  view: ViewIssue
}
