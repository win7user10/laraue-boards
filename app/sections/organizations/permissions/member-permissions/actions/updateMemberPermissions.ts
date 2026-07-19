import type { MemberPermissions } from '../view/MemberPermissionsPage.vue'

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
