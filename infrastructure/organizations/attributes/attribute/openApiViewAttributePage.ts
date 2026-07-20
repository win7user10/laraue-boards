import { createApiClient } from '#infrastructure/api/client'
import { mapAttribute } from '#infrastructure/organizations/attributes/attribute/mapAttribute'
import type { ViewAttributePage } from '~/sections/organizations/attributes/attribute/deps/viewAttributePage'

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
