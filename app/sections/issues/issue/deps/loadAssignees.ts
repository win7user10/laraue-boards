import type { IssueAssigneeOption } from '~/sections/issues/issue/IssuePage.types'
import type { Result } from '~/utils/actionResult'

export type LoadAssignees = (input: { spaceId: string }) => Promise<Result<IssueAssigneeOption[]>>
