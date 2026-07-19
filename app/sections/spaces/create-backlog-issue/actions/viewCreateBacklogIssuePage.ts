import type { CreateBacklogIssuePageViewModel } from '../view/CreateBacklogIssuePage.vue'

type ViewCreateBacklogIssuePageResult = {
  CreateBacklogIssuePage: CreateBacklogIssuePageViewModel
}

type ViewCreateBacklogIssuePageError =
  | 'AccessDenied'
  | 'BacklogNotFound'
  | 'SpaceNotFound'
  | 'TemporarilyUnavailable'

export type ViewCreateBacklogIssuePage = (input: {
  spaceKey: string
}) => Promise<
  ActionResult<
    ViewCreateBacklogIssuePageResult,
    ViewCreateBacklogIssuePageError
  >
>
