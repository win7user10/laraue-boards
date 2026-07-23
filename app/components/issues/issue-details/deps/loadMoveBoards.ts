import type { Result } from '~/utils/actionResult'

import type { IssueDetailsMoveOption } from '../IssueDetails.types'

export type LoadMoveBoards = (input: {
  spaceId: string
}) => Promise<Result<IssueDetailsMoveOption[]>>
