import type { Result } from '~/utils/actionResult'

export type CreateAttributeInput = {
  color: string
  data: { listValues: string[]; type: 'list' } | { type: 'text' }
  name: string
}

export type CreateAttributeFailure =
  | { message: string; type: 'invalidInput' }
  | { type: 'accessDenied' }
  | { type: 'temporarilyUnavailable' }

export type CreateAttributePageDeps = {
  create: (
    input: CreateAttributeInput,
  ) => Promise<Result<{ id: string }, CreateAttributeFailure>>
}
