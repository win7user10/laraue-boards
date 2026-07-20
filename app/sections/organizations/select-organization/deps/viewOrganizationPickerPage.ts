import type { OrganizationPickerPageViewModel } from '~/sections/organizations/select-organization/OrganizationPickerPage.vue'

type ViewOrganizationPickerPageResult = {
  OrganizationPickerPage: OrganizationPickerPageViewModel
}
type ViewOrganizationPickerPageError = 'AccessDenied' | 'TemporarilyUnavailable'

export type ViewOrganizationPickerPage = () => Promise<
  ActionResult<
    ViewOrganizationPickerPageResult,
    ViewOrganizationPickerPageError
  >
>
