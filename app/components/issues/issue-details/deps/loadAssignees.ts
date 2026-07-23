import type { Result } from '~/utils/actionResult'

import type { IssueDetailsAssigneeOption } from '../IssueDetails.types'

export type LoadAssignees = (input: {
  spaceId: string
}) => Promise<Result<IssueDetailsAssigneeOption[]>>
