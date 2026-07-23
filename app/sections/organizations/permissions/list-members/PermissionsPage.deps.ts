import type { Result } from '~/utils/actionResult'

type PermissionsPageMember = {
  color: string
  id: string
  initials: string
  isAdmin: boolean
  isOwner: boolean
  name: string
}

export type ViewPermissionsFailure =
  | { type: 'accessDenied' }
  | { type: 'permissionsNotFound' }
  | { type: 'temporarilyUnavailable' }

export type PermissionsPageDeps = {
  view: (input: {
    signal?: AbortSignal
  }) => Promise<Result<PermissionsPageMember[], ViewPermissionsFailure>>
}
