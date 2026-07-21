import type { OrganizationSettingsPageViewModel } from '~/sections/organizations/settings/components/OrganizationSettingsContent.vue'

type ViewOrganizationSettingsPageResult = {
  OrganizationSettingsPage: OrganizationSettingsPageViewModel
}
type ViewOrganizationSettingsPageError =
  | 'AccessDenied'
  | 'OrganizationNotFound'
  | 'TemporarilyUnavailable'

export type ViewOrganizationSettingsPage = () => Promise<
  ActionResult<
    ViewOrganizationSettingsPageResult,
    ViewOrganizationSettingsPageError
  >
>
