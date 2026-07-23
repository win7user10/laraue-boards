import type { Result } from '~/utils/actionResult'

export type CreateBoardFailure =
  | { message: string; type: 'invalidInput' }
  | { type: 'accessDenied' }
  | { type: 'spaceNotFound' }
  | { type: 'temporarilyUnavailable' }

export type CreateBoardPageDeps = {
  create: (input: {
    color: string
    name: string
    spaceKey: string
  }) => Promise<Result<{ boardId: string }, CreateBoardFailure>>
}
