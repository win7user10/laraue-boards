import type { Result } from '~/utils/actionResult'

export type AssigneeSelectOption = {
  color: string
  initials: string
  label: string
  value: string
}

export type AssigneeSelectDeps = {
  loadAssignees: (input: { spaceId: string }) => Promise<Result<AssigneeSelectOption[]>>
}
