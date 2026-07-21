import type { CreateBacklogIssuePageViewModel } from '~/sections/spaces/create-backlog-issue/components/CreateBacklogIssueContent.vue'

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
