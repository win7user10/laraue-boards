import type { Result } from '~/utils/actionResult'

import type { IssueDetailsStatusOption } from '../IssueDetails.types'

export type LoadStatuses = (input: {
  boardId: string
}) => Promise<Result<IssueDetailsStatusOption[]>>
