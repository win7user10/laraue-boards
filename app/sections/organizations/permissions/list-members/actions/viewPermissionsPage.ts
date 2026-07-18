import type { PermissionsPageViewModel } from '../view/PermissionsPage.vue'

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
