import type { MemberPermissionsPageViewModel } from '~/sections/organizations/permissions/member-permissions/components/MemberPermissionsForm/MemberPermissionsForm.vue'

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
