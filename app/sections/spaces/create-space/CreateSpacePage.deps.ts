import type { Result } from '~/utils/actionResult'

type CreateSpaceInput = {
  color: string
  key: string
  name: string
}

export type CreateSpaceFailure =
  | { message: string; type: 'invalidInput' }
  | { type: 'accessDenied' }
  | { type: 'organizationNotFound' }
  | { type: 'temporarilyUnavailable' }

export type CreateSpacePageDeps = {
  create: (input: CreateSpaceInput) => Promise<Result<{ spaceKey: string }, CreateSpaceFailure>>
}
