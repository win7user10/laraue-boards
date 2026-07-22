import type { Result } from '~/utils/actionResult'

export type SpaceSettingsPageData = {
  canDelete: boolean
  canUpdate: boolean
  color: string
  id: string
  name: string
  spaceKey: string
}

export type ViewSpaceSettingsFailure =
  | { type: 'accessDenied' }
  | { type: 'spaceNotFound' }
  | { type: 'temporarilyUnavailable' }

export type ChangeSpaceFailure =
  | { type: 'accessDenied' }
  | { type: 'spaceNotFound' }
  | { type: 'temporarilyUnavailable' }

export type UpdateSpaceFailure =
  | ChangeSpaceFailure
  | { message: string; type: 'invalidInput' }

export type SpaceSettingsPageDeps = {
  delete: (input: {
    spaceId: string
  }) => Promise<Result<null, ChangeSpaceFailure>>
  update: (input: {
    color: string
    key: string
    name: string
    spaceId: string
  }) => Promise<Result<null, UpdateSpaceFailure>>
  view: (input: {
    signal?: AbortSignal
    spaceKey: string
  }) => Promise<Result<SpaceSettingsPageData, ViewSpaceSettingsFailure>>
}
