import type { IssueDetailsViewModel } from '~/components/issues/issue-details/IssueDetails.types'

export type IssuePageData = IssueDetailsViewModel

export type IssueAssigneeOption = {
  color: string
  initials: string
  label: string
  value: string
}

export type IssueMoveOption = {
  label: string
  value: string
}

export type IssueStatusOption = {
  id: string
  name: string
}
