import type { Result } from '~/utils/actionResult'

export type SpaceBoardSummary = {
  color: string
  id: string
  issueCount: number
  kind: 'backlog' | 'board'
  name: string
  statuses: Array<{ color: string; count: number; name: string }>
}

export type SpacePageData = {
  boards: SpaceBoardSummary[]
  canCreateBoards: boolean
  canManage: boolean
  color: string
  id: string
  key: string
  name: string
}

export type ViewSpaceFailure =
  | { type: 'accessDenied' }
  | { type: 'spaceNotFound' }
  | { type: 'temporarilyUnavailable' }

export type SpacePageDeps = {
  view: (input: {
    signal?: AbortSignal
    spaceKey: string
  }) => Promise<Result<SpacePageData, ViewSpaceFailure>>
}
