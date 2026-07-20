import type { IssuePageViewModel } from '~/sections/issues/issue/components/IssueContent.vue'

type ViewIssuePageResult = { IssuePage: IssuePageViewModel }
type ViewIssuePageError =
  | 'AccessDenied'
  | 'IssueNotFound'
  | 'TemporarilyUnavailable'

export type ViewIssuePage = (input: {
  issueKey: string
}) => Promise<ActionResult<ViewIssuePageResult, ViewIssuePageError>>
