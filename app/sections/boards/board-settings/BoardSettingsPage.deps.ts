import type { Result } from '~/utils/actionResult'

export type BoardSettingsColumn = {
  color: string
  id: string
  name: string
}

export type BoardSettingsColumnDraft = {
  color: string
  id: null | string
  name: string
}

export type BoardSettingsPageData = {
  canDelete: boolean
  canUpdate: boolean
  color: string
  columns: BoardSettingsColumn[]
  name: string
}

export type ViewBoardSettingsFailure =
  | { type: 'accessDenied' }
  | { type: 'boardNotFound' }
  | { type: 'temporarilyUnavailable' }

export type ChangeBoardFailure = ViewBoardSettingsFailure

export type SaveBoardFailure =
  | ChangeBoardFailure
  | { message: string; type: 'invalidInput' }
  | { type: 'boardColumnNotFound' }

export type BoardSettingsPageDeps = {
  remove: (input: { boardId: string }) => Promise<Result<null, ChangeBoardFailure>>
  save: (input: {
    boardId: string
    color: string
    columns: BoardSettingsColumnDraft[]
    name: string
    originalColumns: BoardSettingsColumn[]
  }) => Promise<Result<null, SaveBoardFailure>>
  view: (input: {
    boardId: string
    signal?: AbortSignal
  }) => Promise<Result<BoardSettingsPageData, ViewBoardSettingsFailure>>
}
