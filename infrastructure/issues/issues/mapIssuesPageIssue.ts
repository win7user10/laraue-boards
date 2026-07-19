import type { components } from '../../api/generated.ts'

export const mapIssuesPageIssue = (
  issue: components['schemas']['SearchIssueDto'],
) => ({
  assignee: issue.assignee,
  assigneeInitial: issue.assigneeInitial ?? '?',
  boardColor: issue.epic.color,
  boardName: issue.epic.name,
  canMove: issue.canEdit,
  content: issue.content ?? '',
  id: String(issue.id),
  key: issue.key,
  spaceColor: issue.space.color,
  spaceName: issue.space.name,
  status: issue.status?.name ?? 'Backlog',
  statusColor: issue.status?.color ?? '#98a2b3',
})
