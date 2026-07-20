import type { AttributePageViewModel } from '~/sections/organizations/attributes/attribute/components/AttributeContent.vue'

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
