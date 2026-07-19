import type { DeleteAttribute } from './actions/deleteAttribute'
import type { UpdateAttribute } from './actions/updateAttribute'
import type { ViewAttributePage } from './actions/viewAttributePage'

export type AttributePageApplicationDeps = {
  deleteAttribute: DeleteAttribute
  updateAttribute: UpdateAttribute
  viewAttributePage: ViewAttributePage
}
