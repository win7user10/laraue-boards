import type { Result } from '~/utils/actionResult'

export type DeleteIssue = (input: { issueKey: string }) => Promise<Result<void>>
