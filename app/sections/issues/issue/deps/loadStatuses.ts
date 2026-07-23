import type { IssueStatusOption } from '~/sections/issues/issue/IssuePage.types'
import type { Result } from '~/utils/actionResult'

export type LoadStatuses = (input: { boardId: string }) => Promise<Result<IssueStatusOption[]>>
