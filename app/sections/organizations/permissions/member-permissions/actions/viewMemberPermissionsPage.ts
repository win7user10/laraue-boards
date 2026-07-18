import type { MemberPermissionsPageViewModel } from '../view/MemberPermissionsPage.vue'

type ViewMemberPermissionsPageResult = {
  MemberPermissionsPage: MemberPermissionsPageViewModel
}

type ViewMemberPermissionsPageError =
  | 'AccessDenied'
  | 'PermissionsNotFound'
  | 'TemporarilyUnavailable'

export type ViewMemberPermissionsPage = (input: {
  memberId: string
}) => Promise<
  ActionResult<ViewMemberPermissionsPageResult, ViewMemberPermissionsPageError>
>
