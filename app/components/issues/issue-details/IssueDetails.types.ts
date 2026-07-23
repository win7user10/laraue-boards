import type { IssueAttachmentViewModel } from '~/components/issues/IssueAttachments.vue'

type IssueDetailsAttributeViewModel =
  | {
      color: string
      id: string
      name: string
      options: Array<{ label: string; value: string }>
      type: 'list'
      value: string
    }
  | {
      color: string
      id: string
      name: string
      type: 'text'
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

export type IssueDetailsMoveOption = { label: string; value: string }

export type IssueDetailsAssigneeOption = IssueDetailsMoveOption & {
  color: string
  initials: string
}

export type IssueDetailsStatusOption = {
  id: string
  name: string
}
