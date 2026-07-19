const asyncDataKeyParts = {
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

type AsyncDataKeyScope =
  (typeof asyncDataKeyParts.scope)[keyof typeof asyncDataKeyParts.scope]
type AsyncDataKeyResource =
  (typeof asyncDataKeyParts.resource)[keyof typeof asyncDataKeyParts.resource]

const hasScope = (key: string, scope: AsyncDataKeyScope) =>
  key.startsWith(`${scope}:`)
const hasResource = (key: string, resource: AsyncDataKeyResource) =>
  key.endsWith(`:${resource}`)

export const asyncDataKeys = {
  board: {
    createIssue: (boardId: string) => `board:${boardId}:create-issue`,
    settings: (boardId: string) =>
      `${asyncDataKeyParts.scope.board}:${boardId}:${asyncDataKeyParts.resource.settings}`,
    view: (boardId: string) =>
      `${asyncDataKeyParts.scope.board}:${boardId}:${asyncDataKeyParts.resource.view}`,
  },
  issue: {
    dialog: (issueKey: string) =>
      `${asyncDataKeyParts.scope.issue}:${issueKey}:${asyncDataKeyParts.resource.dialog}`,
    view: (issueKey: string) =>
      `${asyncDataKeyParts.scope.issue}:${issueKey}:${asyncDataKeyParts.resource.view}`,
  },
  organizations: {
    list: 'organizations:list',
  },
  space: {
    backlog: (spaceId: string) =>
      `${asyncDataKeyParts.scope.space}:${spaceId}:${asyncDataKeyParts.resource.backlog}`,
    createBacklogIssue: (spaceId: string) =>
      `space:${spaceId}:create-backlog-issue`,
    settings: (spaceId: string) =>
      `${asyncDataKeyParts.scope.space}:${spaceId}:${asyncDataKeyParts.resource.settings}`,
    view: (spaceId: string) =>
      `${asyncDataKeyParts.scope.space}:${spaceId}:${asyncDataKeyParts.resource.view}`,
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

export const isWorkspaceStructureDataKey = (key: string) =>
  key === asyncDataKeys.workspace.dataMovement ||
  key === asyncDataKeys.workspace.issues ||
  hasScope(key, asyncDataKeyParts.scope.space) ||
  hasScope(key, asyncDataKeyParts.scope.board) ||
  hasScope(key, asyncDataKeyParts.scope.issue)

export const isIssueCollectionDataKey = (key: string) =>
  key === asyncDataKeys.workspace.issues ||
  (hasScope(key, asyncDataKeyParts.scope.space) &&
    hasResource(key, asyncDataKeyParts.resource.backlog))

export const isIssueRelatedDataKey = (key: string) =>
  isIssueCollectionDataKey(key) ||
  (hasScope(key, asyncDataKeyParts.scope.space) &&
    hasResource(key, asyncDataKeyParts.resource.view)) ||
  (hasScope(key, asyncDataKeyParts.scope.board) &&
    hasResource(key, asyncDataKeyParts.resource.view))

export const isSelectedOrganizationDataKey = (key: string) =>
  key !== asyncDataKeys.organizations.list

const clearIssueData = (issueKey: string) =>
  clearNuxtData(
    (key) =>
      isIssueRelatedDataKey(key) ||
      key === asyncDataKeys.issue.dialog(issueKey) ||
      key === asyncDataKeys.issue.view(issueKey),
  )

const clearIssuesDataExcept = (issueKeys: string[], preservedKey: string) => {
  const dataKeys = new Set(
    issueKeys.flatMap((issueKey) => [
      asyncDataKeys.issue.dialog(issueKey),
      asyncDataKeys.issue.view(issueKey),
    ]),
  )
  clearNuxtData(
    (key) =>
      key !== preservedKey && (isIssueRelatedDataKey(key) || dataKeys.has(key)),
  )
}

export const useAsyncDataInvalidation = () => {
  const route = useRoute()
  const currentOrganizationKey = () => {
    const value =
      'organizationKey' in route.params
        ? route.params.organizationKey
        : undefined
    return typeof value === 'string' ? value : ''
  }

  return {
    invalidateAttributes() {
      clearNuxtData(
        (key) =>
          key === asyncDataKeys.workspace.attributes ||
          key.startsWith(workspaceAttributePrefix) ||
          hasScope(key, asyncDataKeyParts.scope.issue),
      )
    },

    invalidateBoardData(boardId: string) {
      clearNuxtData(
        (key) =>
          isIssueCollectionDataKey(key) ||
          (hasScope(key, asyncDataKeyParts.scope.space) &&
            hasResource(key, asyncDataKeyParts.resource.view)) ||
          key === asyncDataKeys.board.view(boardId) ||
          hasScope(key, asyncDataKeyParts.scope.issue),
      )
    },

    invalidateBoardStructure(preservedKey?: string) {
      clearNuxtData(
        (key) => key !== preservedKey && isWorkspaceStructureDataKey(key),
      )
    },

    invalidateIssueCollections() {
      clearNuxtData(isIssueRelatedDataKey)
    },

    invalidateIssueData(issueKey: string) {
      clearIssueData(issueKey)
    },

    invalidateIssueDataExceptBoard(issueKey: string, boardId: string) {
      clearNuxtData(
        (key) =>
          key !== asyncDataKeys.board.view(boardId) &&
          (isIssueRelatedDataKey(key) ||
            key === asyncDataKeys.issue.dialog(issueKey) ||
            key === asyncDataKeys.issue.view(issueKey)),
      )
    },

    invalidateIssueDataExceptIssuePage(issueKey: string) {
      clearIssuesDataExcept([issueKey], asyncDataKeys.issue.view(issueKey))
    },

    invalidateIssuesData(issueKeys: string[]) {
      const dataKeys = new Set(
        issueKeys.flatMap((issueKey) => [
          asyncDataKeys.issue.dialog(issueKey),
          asyncDataKeys.issue.view(issueKey),
        ]),
      )
      clearNuxtData((key) => isIssueRelatedDataKey(key) || dataKeys.has(key))
    },

    invalidateIssuesDataExceptBacklog(issueKeys: string[], spaceId: string) {
      clearIssuesDataExcept(issueKeys, asyncDataKeys.space.backlog(spaceId))
    },

    invalidateIssuesDataExceptIssuesPage(issueKeys: string[]) {
      clearIssuesDataExcept(issueKeys, asyncDataKeys.workspace.issues)
    },

    async invalidateOrganizationData() {
      clearNuxtData(asyncDataKeys.organizations.list)
      clearNuxtData(asyncDataKeys.workspace.dataMovement)
      await refreshNuxtData(
        asyncDataKeys.workspace.layout(currentOrganizationKey()),
      )
    },

    invalidateOrganizations() {
      clearNuxtData(asyncDataKeys.organizations.list)
    },

    async invalidateWorkspaceStructure() {
      await refreshNuxtData(
        asyncDataKeys.workspace.layout(currentOrganizationKey()),
      )
      clearNuxtData(isWorkspaceStructureDataKey)
    },

    resetAllData() {
      clearNuxtData()
    },

    resetSelectedOrganizationData() {
      clearNuxtData(isSelectedOrganizationDataKey)
    },
  }
}
