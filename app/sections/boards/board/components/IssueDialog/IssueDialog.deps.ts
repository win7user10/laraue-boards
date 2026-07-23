import type { IssueDetailsDeps } from '~/components/issues/issue-details/deps'
import type { IssueDetailsViewModel } from '~/components/issues/issue-details/IssueDetails.types'
import type { Result } from '~/utils/actionResult'

export type IssueDialogViewModel = IssueDetailsViewModel

export type IssueFailure =
  | { type: 'accessDenied' }
  | { type: 'issueNotFound' }
  | { type: 'temporarilyUnavailable' }

export type IssueDialogDeps = {
  deleteIssue: (input: { issueKey: string }) => Promise<Result<void>>
  issueDetails: IssueDetailsDeps
  loadIssue: (input: {
    issueKey: string
  }) => Promise<Result<{ IssueDialog: IssueDialogViewModel }, IssueFailure>>
}
