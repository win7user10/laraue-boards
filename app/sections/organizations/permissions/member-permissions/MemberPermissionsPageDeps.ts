import type { MemberPermissionsFormDeps } from '~/sections/organizations/permissions/member-permissions/components/MemberPermissionsForm/MemberPermissionsFormDeps'
import type { ViewMemberPermissionsPage } from '~/sections/organizations/permissions/member-permissions/deps/viewMemberPermissionsPage'

export type MemberPermissionsPageDeps = {
  form: MemberPermissionsFormDeps
  viewMemberPermissionsPage: ViewMemberPermissionsPage
}
