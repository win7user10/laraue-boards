import type { BacklogPageViewModel } from '~/sections/spaces/backlog/components/BacklogContent.vue'

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
