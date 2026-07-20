import type { UpdateOrganization } from '~/sections/organizations/settings/deps/updateOrganization'
import type { ViewOrganizationSettingsPage } from '~/sections/organizations/settings/deps/viewOrganizationSettingsPage'

export type OrganizationSettingsPageDeps = {
  updateOrganization: UpdateOrganization
  viewOrganizationSettingsPage: ViewOrganizationSettingsPage
}
