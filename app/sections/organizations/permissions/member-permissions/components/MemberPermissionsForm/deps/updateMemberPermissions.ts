import type { MemberPermissions } from '~/sections/organizations/permissions/member-permissions/components/MemberPermissionsForm/MemberPermissionsForm.vue'

type UpdateMemberPermissionsResult = null

type UpdateMemberPermissionsError =
  | 'AccessDenied'
  | 'MemberNotFound'
  | 'TemporarilyUnavailable'
  | InvalidInputError

export type UpdateMemberPermissions = (input: {
  memberId: string
  permissions: MemberPermissions
}) => Promise<
  ActionResult<UpdateMemberPermissionsResult, UpdateMemberPermissionsError>
>
