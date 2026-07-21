import type { CreateBoardIssuePageViewModel } from '~/sections/boards/create-issue/components/CreateBoardIssueContent.vue'

type ViewCreateBoardIssuePageResult = {
  CreateBoardIssuePage: CreateBoardIssuePageViewModel
}

type ViewCreateBoardIssuePageError =
  | 'AccessDenied'
  | 'BoardNotFound'
  | 'TemporarilyUnavailable'

export type ViewCreateBoardIssuePage = (input: {
  boardId: string
}) => Promise<
  ActionResult<ViewCreateBoardIssuePageResult, ViewCreateBoardIssuePageError>
>
