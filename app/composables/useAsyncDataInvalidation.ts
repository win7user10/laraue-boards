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
    dialog: (issueId: string) =>
      `${asyncDataKeyParts.scope.issue}:${issueId}:${asyncDataKeyParts.resource.dialog}`,
    view: (issueId: string) =>
      `${asyncDataKeyParts.scope.issue}:${issueId}:${asyncDataKeyParts.resource.view}`,
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

const clearIssueData = (issueId: string) =>
  clearNuxtData(
    (key) =>
      isIssueRelatedDataKey(key) ||
      key === asyncDataKeys.issue.dialog(issueId) ||
      key === asyncDataKeys.issue.view(issueId),
  )

const clearIssuesDataExcept = (issueIds: string[], preservedKey: string) => {
  const issueKeys = new Set(
    issueIds.flatMap((issueId) => [
      asyncDataKeys.issue.dialog(issueId),
      asyncDataKeys.issue.view(issueId),
    ]),
  )
  clearNuxtData(
    (key) =>
      key !== preservedKey &&
      (isIssueRelatedDataKey(key) || issueKeys.has(key)),
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

    invalidateIssueData(issueId: string) {
      clearIssueData(issueId)
    },

    invalidateIssueDataExceptBoard(issueId: string, boardId: string) {
      clearNuxtData(
        (key) =>
          key !== asyncDataKeys.board.view(boardId) &&
          (isIssueRelatedDataKey(key) ||
            key === asyncDataKeys.issue.dialog(issueId) ||
            key === asyncDataKeys.issue.view(issueId)),
      )
    },

    invalidateIssueDataExceptIssuePage(issueId: string) {
      clearIssuesDataExcept([issueId], asyncDataKeys.issue.view(issueId))
    },

    invalidateIssuesData(issueIds: string[]) {
      const issueKeys = new Set(
        issueIds.flatMap((issueId) => [
          asyncDataKeys.issue.dialog(issueId),
          asyncDataKeys.issue.view(issueId),
        ]),
      )
      clearNuxtData((key) => isIssueRelatedDataKey(key) || issueKeys.has(key))
    },

    invalidateIssuesDataExceptBacklog(issueIds: string[], spaceId: string) {
      clearIssuesDataExcept(issueIds, asyncDataKeys.space.backlog(spaceId))
    },

    invalidateIssuesDataExceptIssuesPage(issueIds: string[]) {
      clearIssuesDataExcept(issueIds, asyncDataKeys.workspace.issues)
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
