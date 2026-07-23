import type { ActionFailure, Result } from '~/utils/actionResult'

export type IssueDetailsSavedIssue = {
  boardId: string
  complete: boolean
  content: string
  issueKey: string
  previousBoardId: string
  previousStatusId: string
  statusId: string
}

export type SaveIssueFailure =
  | ActionFailure
  | { issue: IssueDetailsSavedIssue; type: 'partiallySaved' }
  | { message: string; type: 'invalidInput' }

export type SaveIssue = (input: {
  assigneeId: string
  attributeValues: Array<
    | { attributeId: string; type: 'list'; valueId: string }
    | { attributeId: string; type: 'text'; value: string }
  >
  boardId: string
  content: string
  files: File[]
  issueKey: string
  previousBoardId: string
  previousStatusId: string
  removeAttachmentIds: string[]
  statusId: string
}) => Promise<Result<IssueDetailsSavedIssue, SaveIssueFailure>>
