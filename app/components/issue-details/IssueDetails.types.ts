import type { IssueAttachmentViewModel } from '~/components/issue-attachments/IssueAttachments.types'
import type { IssueAttributeField } from '~/components/issue-attribute-fields/IssueAttributeFields.types'

type IssueDetailsAttributeViewModel = IssueAttributeField & {
  value: string
}

export type IssueDetailsViewModel = {
  assignee: string
  assigneeColor: string
  assigneeId: string
  assigneeInitial: string
  attachments: IssueAttachmentViewModel[]
  attributes: IssueDetailsAttributeViewModel[]
  boardId: string
  boardLabel: string
  canEdit: boolean
  content: string
  createdAt: string
  issueKey: string
  owner: string
  ownerColor: string
  ownerInitial: string
  spaceId: string
  spaceLabel: string
  statusId: string
  statusLabel: string
  updatedAt: string
}
