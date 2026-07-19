import type { AttributesPageViewModel } from '../view/AttributesPage.vue'

export type ViewAttributesPageResult = {
  AttributesPage: AttributesPageViewModel
}

type ViewAttributesPageError = 'AccessDenied' | 'TemporarilyUnavailable'

export type ViewAttributesPage = () => Promise<
  ActionResult<ViewAttributesPageResult, ViewAttributesPageError>
>
