import type { DataMovementPageViewModel } from '~/sections/organizations/data-movement/components/DataMovementContent.vue'

export type ViewDataMovementPageResult = {
  DataMovementPage: DataMovementPageViewModel
}

type ViewDataMovementPageError = 'AccessDenied' | 'TemporarilyUnavailable'

export type ViewDataMovementPage = () => Promise<
  ActionResult<ViewDataMovementPageResult, ViewDataMovementPageError>
>
