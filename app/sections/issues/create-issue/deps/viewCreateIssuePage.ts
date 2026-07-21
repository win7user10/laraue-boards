import type { CreateIssuePageViewModel } from '~/sections/issues/create-issue/components/CreateIssueContent.vue'

type ViewCreateIssuePageResult = {
  CreateIssuePage: CreateIssuePageViewModel
}

type ViewCreateIssuePageError = 'AccessDenied' | 'TemporarilyUnavailable'

export type ViewCreateIssuePage = () => Promise<
  ActionResult<ViewCreateIssuePageResult, ViewCreateIssuePageError>
>
