import type { Result } from '~/utils/actionResult'

export type StatusSelectOption = {
  label: string
  value: string
}

export type StatusSelectDeps = {
  loadStatuses: (input: { boardId: string }) => Promise<Result<StatusSelectOption[]>>
}
