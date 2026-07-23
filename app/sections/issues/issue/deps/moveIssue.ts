import type { Result } from '~/utils/actionResult'

export type MoveIssue = (input: { issueKey: string; statusId: string }) => Promise<Result<void>>
