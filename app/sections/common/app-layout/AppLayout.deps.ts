import type { Result } from '~/utils/actionResult'

export type AppLayoutData = {
  organization: {
    canCreateSpaces: boolean
    canManage: boolean
    canManageAttributes: boolean
    canMassMove: boolean
    canUpdate: boolean
    color: string
    id: string
    initial: string
    name: string
  }
  spaces: Array<{
    color: string
    id: string
    key: string
    name: string
  }>
  user: { color: string; initials: string; name: string }
}

export type ViewAppLayoutFailure =
  | { type: 'accessDenied' }
  | { type: 'organizationSwitchRequired' }
  | { type: 'temporarilyUnavailable' }
  | { type: 'workspaceNotFound' }

export type AppLayoutDeps = {
  logout: () => Promise<void>
  view: (input: {
    organizationKey: string
    signal?: AbortSignal
  }) => Promise<Result<AppLayoutData, ViewAppLayoutFailure>>
}
