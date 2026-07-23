import type { ActionFailure, Result } from '~/utils/actionResult'

export type UpdateIssueFailure = ActionFailure | { message: string; type: 'invalidInput' }

export type UpdateIssue = (input: {
  assigneeId: string
  attributeValues: Array<
    | { attributeId: string; type: 'list'; valueId: string }
    | { attributeId: string; type: 'text'; value: string }
  >
  content: string
  files: File[]
  issueKey: string
  removeAttachmentIds: string[]
}) => Promise<Result<void, UpdateIssueFailure>>
