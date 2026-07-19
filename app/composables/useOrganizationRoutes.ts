import type { RouteLocationRaw } from 'vue-router'
import type { RouteNamedMap } from 'vue-router/auto-routes'

export type OrganizationRouteName = Extract<
  keyof RouteNamedMap,
  `organizations-organizationKey-${string}`
>

export const useOrganizationRoutes = () => {
  const route = useRoute<OrganizationRouteName>()
  const organizationKey = computed(() => route.params.organizationKey)
  const organizationParams = () => ({
    organizationKey: organizationKey.value,
  })

  return {
    attribute: (id: string) =>
      ({
        name: 'organizations-organizationKey-settings-attributes-id',
        params: { ...organizationParams(), id },
      }) satisfies RouteLocationRaw,
    attributes: () =>
      ({
        name: 'organizations-organizationKey-settings-attributes',
        params: organizationParams(),
      }) satisfies RouteLocationRaw,
    backlog: (spaceKey: string) =>
      ({
        name: 'organizations-organizationKey-spaces-spaceKey-backlog',
        params: { ...organizationParams(), spaceKey },
      }) satisfies RouteLocationRaw,
    board: (spaceKey: string, boardId: string) =>
      ({
        name: 'organizations-organizationKey-spaces-spaceKey-boardId',
        params: { ...organizationParams(), boardId, spaceKey },
      }) satisfies RouteLocationRaw,
    boardSettings: (spaceKey: string, boardId: string) =>
      ({
        name: 'organizations-organizationKey-spaces-spaceKey-boardId-settings',
        params: { ...organizationParams(), boardId, spaceKey },
      }) satisfies RouteLocationRaw,
    dataMovement: () =>
      ({
        name: 'organizations-organizationKey-settings-data-movement',
        params: organizationParams(),
      }) satisfies RouteLocationRaw,
    issue: (issueKey: string) =>
      ({
        name: 'organizations-organizationKey-issues-issueKey',
        params: { ...organizationParams(), issueKey },
      }) satisfies RouteLocationRaw,
    issues: () =>
      ({
        name: 'organizations-organizationKey-issues',
        params: organizationParams(),
      }) satisfies RouteLocationRaw,
    memberPermissions: (id: string) =>
      ({
        name: 'organizations-organizationKey-settings-permissions-id',
        params: { ...organizationParams(), id },
      }) satisfies RouteLocationRaw,
    newAttribute: () =>
      ({
        name: 'organizations-organizationKey-settings-attributes-new',
        params: organizationParams(),
      }) satisfies RouteLocationRaw,
    newBacklogIssue: (spaceKey: string) =>
      ({
        name: 'organizations-organizationKey-spaces-spaceKey-backlog-issues-new',
        params: { ...organizationParams(), spaceKey },
      }) satisfies RouteLocationRaw,
    newBoard: (spaceKey: string) =>
      ({
        name: 'organizations-organizationKey-spaces-spaceKey-boards-new',
        params: { ...organizationParams(), spaceKey },
      }) satisfies RouteLocationRaw,
    newBoardIssue: (spaceKey: string, boardId: string) =>
      ({
        name: 'organizations-organizationKey-spaces-spaceKey-boardId-issues-new',
        params: { ...organizationParams(), boardId, spaceKey },
      }) satisfies RouteLocationRaw,
    newIssue: () =>
      ({
        name: 'organizations-organizationKey-issues-new',
        params: organizationParams(),
      }) satisfies RouteLocationRaw,
    newSpace: () =>
      ({
        name: 'organizations-organizationKey-spaces-new',
        params: organizationParams(),
      }) satisfies RouteLocationRaw,
    organizationKey,
    permissions: () =>
      ({
        name: 'organizations-organizationKey-settings-permissions',
        params: organizationParams(),
      }) satisfies RouteLocationRaw,
    settings: () =>
      ({
        name: 'organizations-organizationKey-settings',
        params: organizationParams(),
      }) satisfies RouteLocationRaw,
    space: (spaceKey: string) =>
      ({
        name: 'organizations-organizationKey-spaces-spaceKey',
        params: { ...organizationParams(), spaceKey },
      }) satisfies RouteLocationRaw,
    spaceSettings: (spaceKey: string) =>
      ({
        name: 'organizations-organizationKey-spaces-spaceKey-settings',
        params: { ...organizationParams(), spaceKey },
      }) satisfies RouteLocationRaw,
  }
}
