import type { UpdateMemberPermissions } from './actions/updateMemberPermissions'
import type { ViewMemberPermissionsPage } from './actions/viewMemberPermissionsPage'

export type MemberPermissionsPageApplicationDeps = {
  updateMemberPermissions: UpdateMemberPermissions
  viewMemberPermissionsPage: ViewMemberPermissionsPage
}
