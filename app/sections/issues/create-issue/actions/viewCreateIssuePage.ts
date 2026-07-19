import type { CreateIssuePageViewModel } from '../view/CreateIssuePage.vue'

type ViewCreateIssuePageResult = {
  CreateIssuePage: CreateIssuePageViewModel
}

type ViewCreateIssuePageError = 'AccessDenied' | 'TemporarilyUnavailable'

export type ViewCreateIssuePage = () => Promise<
  ActionResult<ViewCreateIssuePageResult, ViewCreateIssuePageError>
>
