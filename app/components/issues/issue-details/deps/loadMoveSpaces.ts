import type { Result } from '~/utils/actionResult'

import type { IssueDetailsMoveOption } from '../IssueDetails.types'

export type LoadMoveSpaces = () => Promise<Result<IssueDetailsMoveOption[]>>
