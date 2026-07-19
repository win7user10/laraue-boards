import type { SelectOrganization } from './actions/selectOrganization'
import type { ViewOrganizationPickerPage } from './actions/viewOrganizationPickerPage'

export type SelectOrganizationPageApplicationDeps = {
  selectOrganization: SelectOrganization
  viewOrganizationPickerPage: ViewOrganizationPickerPage
}
