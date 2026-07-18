import type { ViewAttributePage } from '../../../../app/sections/organizations/attributes/attribute/actions/viewAttributePage'
import { createApiClient } from '../../../api/client'
import { mapAttribute } from './mapAttribute'

export const openApiViewAttributePage =
  (baseUrl: string): ViewAttributePage =>
  async (input) => {
    const client = createApiClient(baseUrl)
    try {
      const response = await client.GET('/api/organizations/attributes')
      switch (response.response.status) {
        case 200:
          break
        case 401:
        case 403:
          return err('AccessDenied')
        default:
          return err('TemporarilyUnavailable')
      }
      if (!response.data) {
        return err('TemporarilyUnavailable')
      }
      const attribute = response.data.find(
        (item) => String(item.id) === input.attributeId,
      )
      if (!attribute) {
        return err('AttributeNotFound')
      }
      return ok({
        AttributePage: { EditAttributeForm: mapAttribute(attribute) },
      })
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
