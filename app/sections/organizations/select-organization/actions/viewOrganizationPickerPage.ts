import type { OrganizationPickerPageViewModel } from '../view/OrganizationPickerPage.vue'

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
