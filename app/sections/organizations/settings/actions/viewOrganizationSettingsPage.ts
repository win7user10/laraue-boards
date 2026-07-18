import type { OrganizationSettingsPageViewModel } from '../view/OrganizationSettingsPage.vue'

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
