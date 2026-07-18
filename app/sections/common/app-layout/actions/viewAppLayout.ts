import type { AppLayoutViewModel } from '../view/AppLayout.vue'

type ViewAppLayoutResult = {
  AppLayout: AppLayoutViewModel
}

type ViewAppLayoutError =
  | 'AccessDenied'
  | 'OrganizationSwitchRequired'
  | 'TemporarilyUnavailable'
  | 'WorkspaceNotFound'

export type ViewAppLayout = (input: {
  organizationKey: string
}) => Promise<ActionResult<ViewAppLayoutResult, ViewAppLayoutError>>
