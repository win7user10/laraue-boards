import type { UpdateOrganization } from './actions/updateOrganization'
import type { ViewOrganizationSettingsPage } from './actions/viewOrganizationSettingsPage'

export type OrganizationSettingsPageApplicationDeps = {
  updateOrganization: UpdateOrganization
  viewOrganizationSettingsPage: ViewOrganizationSettingsPage
}
