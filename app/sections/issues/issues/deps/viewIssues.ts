import type { IssuesPageData } from '~/sections/issues/issues/IssuesPage.types'
import type { Result } from '~/utils/actionResult'

export type ViewIssuesFailure = { type: 'accessDenied' } | { type: 'temporarilyUnavailable' }

export type ViewIssues = (input: {
  attributeQuery: Record<string, string[]>
  page: number
  search: string
  signal?: AbortSignal
  spaceIds: string[]
}) => Promise<Result<IssuesPageData, ViewIssuesFailure>>
