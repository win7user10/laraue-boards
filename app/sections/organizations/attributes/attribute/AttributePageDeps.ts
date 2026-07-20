import type { DeleteAttribute } from '~/sections/organizations/attributes/attribute/deps/deleteAttribute'
import type { UpdateAttribute } from '~/sections/organizations/attributes/attribute/deps/updateAttribute'
import type { ViewAttributePage } from '~/sections/organizations/attributes/attribute/deps/viewAttributePage'

export type AttributePageDeps = {
  deleteAttribute: DeleteAttribute
  updateAttribute: UpdateAttribute
  viewAttributePage: ViewAttributePage
}
