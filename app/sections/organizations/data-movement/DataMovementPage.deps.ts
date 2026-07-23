import type { Result } from '~/utils/actionResult'

export type MoveOption = { label: string; value: string }

export type DataMovementPageData = {
  currentOrganizationId: string
  currentSpaces: MoveOption[]
  organizations: MoveOption[]
  spaceOrganizations: MoveOption[]
  spaces: Array<{
    boards: Array<{ color: string; id: string; name: string }>
    color: string
    id: string
    isDefault: boolean
    name: string
  }>
}

export type ViewDataMovementFailure = { type: 'accessDenied' } | { type: 'temporarilyUnavailable' }

export type LoadDestinationSpacesFailure =
  | { type: 'accessDenied' }
  | { type: 'organizationNotFound' }
  | { type: 'temporarilyUnavailable' }

export type MoveDataFailure =
  | { type: 'accessDenied' }
  | { type: 'invalidDestination' }
  | { type: 'resourceNotFound' }
  | { type: 'temporarilyUnavailable' }

export type DataMovementPageDeps = {
  loadSpaces: (input: {
    organizationId: string
  }) => Promise<Result<MoveOption[], LoadDestinationSpacesFailure>>
  moveBoards: (input: {
    boardIds: string[]
    destinationSpaceId: string
  }) => Promise<Result<void, MoveDataFailure>>
  moveSpaces: (input: {
    destinationOrganizationId: string
    spaceIds: string[]
  }) => Promise<Result<void, MoveDataFailure>>
  view: (input: {
    signal?: AbortSignal
  }) => Promise<Result<DataMovementPageData, ViewDataMovementFailure>>
}
