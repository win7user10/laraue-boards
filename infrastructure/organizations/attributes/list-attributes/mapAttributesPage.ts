import type { ViewAttributesPageResult } from '../../../../app/sections/organizations/attributes/list-attributes/actions/viewAttributesPage'
import type { components } from '../../../api/generated'

type Schemas = components['schemas']

function mapAttributeType(type: Schemas['AttributeType']) {
  switch (type) {
    case 0:
      return 'text' as const
    case 1:
      return 'list' as const
    default:
      throw new RangeError(`Unsupported attribute type: ${type}`)
  }
}

export function mapAttributesPage(
  attributes: Schemas['AttributeDto'][],
): ViewAttributesPageResult {
  return {
    AttributesPage: {
      attributes: attributes.map((attribute) => {
        if (attribute.id === undefined) {
          throw new TypeError('Attribute id is required')
        }
        const type = mapAttributeType(attribute.type)
        return {
          color: attribute.color,
          id: String(attribute.id),
          name: attribute.name,
          type,
        }
      }),
    },
  }
}
