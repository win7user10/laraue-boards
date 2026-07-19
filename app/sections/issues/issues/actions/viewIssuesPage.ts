import type { IssuesPageViewModel } from '../view/IssuesPage.vue'

export type ViewIssuesPageResult = { IssuesPage: IssuesPageViewModel }
type ViewIssuesPageError = 'AccessDenied' | 'TemporarilyUnavailable'

export type ViewIssuesPage = (input: {
  attributeQuery: Record<string, string[]>
  page: number
  search: string
  spaceIds: string[]
}) => Promise<ActionResult<ViewIssuesPageResult, ViewIssuesPageError>>
