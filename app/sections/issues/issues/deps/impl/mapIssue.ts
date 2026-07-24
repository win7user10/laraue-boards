import type { components } from '#infrastructure/api/generated'
import type { IssueListItem } from '~/components/issue-list/IssueList.types'
import { COLORS } from '~/constants/colors'

export const mapIssue = (issue: components['schemas']['SearchIssueDto']): IssueListItem => ({
  assignee: issue.assignee,
  assigneeColor: issue.assigneeColor,
  assigneeInitial: issue.assigneeInitial ?? '?',
  boardColor: issue.epic.color,
  boardName: issue.epic.name,
  canMove: issue.canEdit,
  content: issue.content ?? '',
  issueKey: issue.key,
  spaceColor: issue.space.color,
  spaceName: issue.space.name,
  status: issue.status?.name ?? 'Backlog',
  statusColor: issue.status?.color ?? COLORS.gray,
})
