import type { AttributePageViewModel } from '../view/AttributePage.vue'

type ViewAttributePageResult = {
  AttributePage: AttributePageViewModel
}

type ViewAttributePageError =
  | 'AccessDenied'
  | 'AttributeNotFound'
  | 'TemporarilyUnavailable'

export type ViewAttributePage = (input: {
  attributeId: string
}) => Promise<ActionResult<ViewAttributePageResult, ViewAttributePageError>>
