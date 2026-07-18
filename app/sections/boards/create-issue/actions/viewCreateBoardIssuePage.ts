import type { CreateBoardIssuePageViewModel } from '../view/CreateBoardIssuePage.vue'

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
