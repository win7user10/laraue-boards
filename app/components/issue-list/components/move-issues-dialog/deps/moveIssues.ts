import type { Result } from '~/utils/actionResult'

export type MoveIssues = (input: { issueKeys: string[]; statusId: string }) => Promise<Result<void>>
