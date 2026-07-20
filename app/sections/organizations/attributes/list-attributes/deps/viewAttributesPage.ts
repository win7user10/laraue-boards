import type { AttributesPageViewModel } from '~/sections/organizations/attributes/list-attributes/AttributesPage.vue'

export type ViewAttributesPageResult = {
  AttributesPage: AttributesPageViewModel
}

type ViewAttributesPageError = 'AccessDenied' | 'TemporarilyUnavailable'

export type ViewAttributesPage = () => Promise<
  ActionResult<ViewAttributesPageResult, ViewAttributesPageError>
>
