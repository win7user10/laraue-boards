import type { DataMovementPageViewModel } from '../view/DataMovementPage.vue'

export type ViewDataMovementPageResult = {
  DataMovementPage: DataMovementPageViewModel
}

type ViewDataMovementPageError = 'AccessDenied' | 'TemporarilyUnavailable'

export type ViewDataMovementPage = () => Promise<
  ActionResult<ViewDataMovementPageResult, ViewDataMovementPageError>
>
