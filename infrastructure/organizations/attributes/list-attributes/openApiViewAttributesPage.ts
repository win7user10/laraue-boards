import type { ViewAttributesPage } from '../../../../app/sections/organizations/attributes/list-attributes/actions/viewAttributesPage'
import { createApiClient } from '../../../api/client'
import { mapAttributesPage } from './mapAttributesPage'

export const openApiViewAttributesPage = (
  baseUrl: string,
): ViewAttributesPage => {
  const client = createApiClient(baseUrl)
  return async () => {
    try {
      const attributes = await client.GET('/api/organizations/attributes')
      switch (attributes.response.status) {
        case 200:
          break
        case 401:
        case 403:
          return err('AccessDenied')
        default:
          return err('TemporarilyUnavailable')
      }
      return attributes.data
        ? ok(mapAttributesPage(attributes.data))
        : err('TemporarilyUnavailable')
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
}
