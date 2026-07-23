import type { IssuePageData } from '~/sections/issues/issue/IssuePage.types'
import type { Result } from '~/utils/actionResult'

export type ViewIssueFailure =
  | { type: 'accessDenied' }
  | { type: 'issueNotFound' }
  | { type: 'temporarilyUnavailable' }

export type ViewIssue = (input: {
  issueKey: string
  signal?: AbortSignal
}) => Promise<Result<IssuePageData, ViewIssueFailure>>
