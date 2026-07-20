const keyParts = {
  resource: {
    backlog: 'backlog',
    dialog: 'dialog',
    settings: 'settings',
    view: 'view',
  },
  scope: {
    board: 'board',
    issue: 'issue',
    space: 'space',
  },
} as const

const workspaceAttributePrefix = 'workspace:attribute:'
const workspaceLayoutPrefix = 'workspace:layout:'

type KeyScope = (typeof keyParts.scope)[keyof typeof keyParts.scope]
type KeyResource = (typeof keyParts.resource)[keyof typeof keyParts.resource]
export type DataScope =
  | 'attributes'
  | 'issues'
  | 'organizations'
  | 'selectedOrganization'
  | 'structure'

const hasScope = (key: string, scope: KeyScope) => key.startsWith(`${scope}:`)
const hasResource = (key: string, resource: KeyResource) =>
  key.endsWith(`:${resource}`)

export const dataKeys = {
  board: {
    createIssue: (boardId: string) => `board:${boardId}:create-issue`,
    settings: (boardId: string) =>
      `${keyParts.scope.board}:${boardId}:${keyParts.resource.settings}`,
    view: (boardId: string) =>
      `${keyParts.scope.board}:${boardId}:${keyParts.resource.view}`,
  },
  issue: {
    dialog: (issueKey: string) =>
      `${keyParts.scope.issue}:${issueKey}:${keyParts.resource.dialog}`,
    view: (issueKey: string) =>
      `${keyParts.scope.issue}:${issueKey}:${keyParts.resource.view}`,
  },
  organizations: {
    list: 'organizations:list',
  },
  space: {
    backlog: (spaceId: string) =>
      `${keyParts.scope.space}:${spaceId}:${keyParts.resource.backlog}`,
    createBacklogIssue: (spaceId: string) =>
      `space:${spaceId}:create-backlog-issue`,
    settings: (spaceId: string) =>
      `${keyParts.scope.space}:${spaceId}:${keyParts.resource.settings}`,
    view: (spaceId: string) =>
      `${keyParts.scope.space}:${spaceId}:${keyParts.resource.view}`,
  },
  workspace: {
    attribute: (attributeId: string) =>
      `${workspaceAttributePrefix}${attributeId}`,
    attributes: 'workspace:attributes',
    createIssue: 'workspace:create-issue',
    dataMovement: 'workspace:data-movement',
    issues: 'workspace:issues',
    layout: (organizationId: string) =>
      `${workspaceLayoutPrefix}${organizationId}`,
    memberPermissions: (memberId: string) =>
      `workspace:permissions:${memberId}`,
    permissions: 'workspace:permissions',
    settings: 'workspace:settings',
  },
} as const

const scopeMatchers: Record<DataScope, (key: string) => boolean> = {
  attributes: (key) =>
    key === dataKeys.workspace.attributes ||
    key.startsWith(workspaceAttributePrefix) ||
    hasScope(key, keyParts.scope.issue),
  issues: (key) =>
    key === dataKeys.workspace.issues ||
    hasScope(key, keyParts.scope.issue) ||
    (hasScope(key, keyParts.scope.space) &&
      (hasResource(key, keyParts.resource.backlog) ||
        hasResource(key, keyParts.resource.view))) ||
    (hasScope(key, keyParts.scope.board) &&
      hasResource(key, keyParts.resource.view)),
  organizations: (key) =>
    key === dataKeys.organizations.list ||
    key === dataKeys.workspace.dataMovement,
  selectedOrganization: (key) => key !== dataKeys.organizations.list,
  structure: (key) =>
    key === dataKeys.workspace.dataMovement ||
    key === dataKeys.workspace.issues ||
    hasScope(key, keyParts.scope.space) ||
    hasScope(key, keyParts.scope.board) ||
    hasScope(key, keyParts.scope.issue),
}

export const matchesDataScope = (key: string, scope: DataScope) =>
  scopeMatchers[scope](key)

export const invalidateAllData = () => clearNuxtData()
export const invalidateDataKey = (key: string) => clearNuxtData(key)
export const refreshDataKey = (key: string) => refreshNuxtData(key)

export const invalidateData = ({
  preserve = [],
  scope,
}: {
  preserve?: string[]
  scope: DataScope
}) => {
  const preserved = new Set(preserve)
  clearNuxtData((key) => !preserved.has(key) && matchesDataScope(key, scope))
}
