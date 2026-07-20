import type { BoardPageViewModel } from '~/sections/boards/board/BoardPage.vue'

export type ViewBoardPageResult = {
  BoardPage: BoardPageViewModel
}

export type ViewBoardPageError =
  | 'AccessDenied'
  | 'BoardNotFound'
  | 'TemporarilyUnavailable'

export type ViewBoardPage = (input: {
  attributeQuery: Record<string, string[]>
  boardId: string
  search: string
}) => Promise<ActionResult<ViewBoardPageResult, ViewBoardPageError>>
