import type { BacklogPageViewModel } from '../view/BacklogPage.vue'

export type ViewBacklogPageResult = { BacklogPage: BacklogPageViewModel }
type ViewBacklogPageError =
  | 'AccessDenied'
  | 'SpaceNotFound'
  | 'TemporarilyUnavailable'

export type ViewBacklogPage = (input: {
  attributeQuery: Record<string, string[]>
  page: number
  search: string
  spaceKey: string
}) => Promise<ActionResult<ViewBacklogPageResult, ViewBacklogPageError>>
