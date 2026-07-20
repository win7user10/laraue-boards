import type { components } from '#infrastructure/api/generated'
import type { EditAttributeFormViewModel } from '~/sections/organizations/attributes/attribute/components/EditAttributeForm.vue'

type Attribute = components['schemas']['AttributeDto']

export function mapAttribute(attribute: Attribute): EditAttributeFormViewModel {
  if (attribute.id === undefined) {
    throw new TypeError('Attribute id is required')
  }
  switch (attribute.type) {
    case 0:
      return {
        color: attribute.color,
        data: { type: 'text' },
        id: String(attribute.id),
        name: attribute.name,
      }
    case 1:
      return {
        color: attribute.color,
        data: {
          listValues: attribute.listValues.map((option) => {
            if (option.id === undefined) {
              throw new TypeError('Attribute option id is required')
            }
            return { id: String(option.id), name: option.name }
          }),
          type: 'list',
        },
        id: String(attribute.id),
        name: attribute.name,
      }
    default:
      throw new RangeError(`Unsupported attribute type: ${attribute.type}`)
  }
}
