import type { Result } from '~/utils/actionResult'

export type SpaceSelectOption = {
  label: string
  value: string
}

export type SpaceSelectDeps = {
  loadSpaces: (input: { organizationId?: string }) => Promise<Result<SpaceSelectOption[]>>
}
