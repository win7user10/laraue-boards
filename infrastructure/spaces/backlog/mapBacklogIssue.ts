import type { components } from '#infrastructure/api/generated.ts'
import { COLORS } from '~/constants/colors'

export const mapBacklogIssue = (
  issue: components['schemas']['SearchIssueDto'],
) => ({
  assignee: issue.assignee,
  assigneeColor: issue.assigneeColor,
  assigneeInitial: issue.assigneeInitial ?? '?',
  boardColor: issue.epic.color,
  boardName: issue.epic.name,
  canMove: issue.canEdit,
  content: issue.content ?? '',
  issueKey: issue.key,
  status: issue.status?.name ?? 'Backlog',
  statusColor: issue.status?.color ?? COLORS.gray,
})
