import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import type {
  AttributeListItem,
  AttributesPageDeps,
  ViewAttributesFailure,
} from '~/sections/organizations/attributes/list-attributes/AttributesPage.deps'
import { err, ok } from '~/utils/actionResult'

const mapType = (type: components['schemas']['AttributeType']): AttributeListItem['type'] => {
  switch (type) {
    case 0:
      return 'text'
    case 1:
      return 'list'
    default:
      throw new RangeError(`Unsupported attribute type: ${type}`)
  }
}

const mapFailure = (status: number): undefined | ViewAttributesFailure => {
  if (status === 401 || status === 403) {
    return { type: 'accessDenied' }
  }
  if (status >= 500) {
    return { type: 'temporarilyUnavailable' }
  }
}

export function createAttributesPageDeps(client: ApiClient): AttributesPageDeps {
  return {
    async view({ signal }) {
      const response = await client.GET('/api/organizations/attributes', {
        signal,
      })
      if ('error' in response) {
        const failure = mapFailure(response.response.status)
        if (failure) {
          return err(failure)
        }
        throw new Error(`Unrecognized attributes response: ${response.response.status}`)
      }
      return ok(
        response.data.map((attribute) => {
          if (attribute.id === undefined) {
            throw new TypeError('Attribute id is required')
          }
          return {
            color: attribute.color,
            id: String(attribute.id),
            name: attribute.name,
            type: mapType(attribute.type),
          }
        }),
      )
    },
  }
}
