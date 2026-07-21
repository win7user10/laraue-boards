import type { PermissionsPageViewModel } from '~/sections/organizations/permissions/list-members/PermissionsPage.vue'

type ViewPermissionsPageResult = {
  PermissionsPage: PermissionsPageViewModel
}

type ViewPermissionsPageError =
  | 'AccessDenied'
  | 'PermissionsNotFound'
  | 'TemporarilyUnavailable'

export type ViewPermissionsPage = () => Promise<
  ActionResult<ViewPermissionsPageResult, ViewPermissionsPageError>
>
