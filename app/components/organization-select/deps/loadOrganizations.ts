import type { Result } from '~/utils/actionResult'

export type OrganizationSelectOption = {
  label: string
  value: string
}

export type OrganizationSelectDeps = {
  loadOrganizations: () => Promise<Result<OrganizationSelectOption[]>>
}
