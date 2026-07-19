import type { IssuePageViewModel } from '../view/IssuePage.vue'

type ViewIssuePageResult = { IssuePage: IssuePageViewModel }
type ViewIssuePageError =
  | 'AccessDenied'
  | 'IssueNotFound'
  | 'TemporarilyUnavailable'

export type ViewIssuePage = (input: {
  issueId: string
}) => Promise<ActionResult<ViewIssuePageResult, ViewIssuePageError>>
