import type { components } from '#infrastructure/api/generated'

type Schemas = components['schemas']
type IssueFilter =
  | { attributeId: string; searchString: string; type: 'text' }
  | { attributeId: string; type: 'list'; valueIds: string[] }
type IssueAttributeValueInput =
  | { attributeId: string; type: 'list'; valueId: string }
  | { attributeId: string; type: 'text'; value: string }
type IssueAttribute =
  | { color: string; id: string; name: string; type: 'text' }
  | {
      color: string
      id: string
      name: string
      options: Array<{ label: string; value: string }>
      type: 'list'
    }

export function mapIssueAttributes(
  attributes: Schemas['AttributeDto'][],
): IssueAttribute[] {
  return attributes.map((attribute) => {
    if (attribute.id === undefined) {
      throw new TypeError('Attribute id is required')
    }
    const base = {
      color: attribute.color,
      id: String(attribute.id),
      name: attribute.name,
    }
    switch (attribute.type) {
      case 0:
        return { ...base, type: 'text' }
      case 1:
        return {
          ...base,
          options: attribute.listValues.map((option) => {
            if (option.id === undefined) {
              throw new TypeError('Attribute option id is required')
            }
            return { label: option.name, value: String(option.id) }
          }),
          type: 'list',
        }
      default:
        throw new RangeError(`Unsupported attribute type: ${attribute.type}`)
    }
  })
}

export function mapIssueFilters(filters: IssueFilter[]) {
  return Object.fromEntries(
    filters.map((filter) => [
      filter.attributeId,
      filter.type === 'text'
        ? { $type: 'string' as const, searchString: filter.searchString }
        : { $type: 'enum' as const, ids: filter.valueIds },
    ]),
  ) satisfies Record<string, Schemas['AttributeFilterValue']>
}

export function mapIssueAttributeValues(values: IssueAttributeValueInput[]) {
  return values.map((value) =>
    value.type === 'text'
      ? {
          $type: 'string' as const,
          attributeId: value.attributeId,
          value: value.value,
        }
      : {
          $type: 'enum' as const,
          attributeId: value.attributeId,
          valueId: value.valueId,
        },
  ) satisfies Schemas['AttributeValue'][]
}

export function mapRawIssueFilters(
  raw: Record<string, string[]>,
  attributeDtos: Schemas['AttributeDto'][],
) {
  const attributes = mapIssueAttributes(attributeDtos)
  const filters: IssueFilter[] = []
  for (const attribute of attributes) {
    const values = raw[attribute.id] ?? []
    if (attribute.type === 'text') {
      const searchString = values.at(-1)?.trim()
      if (searchString) {
        filters.push({ attributeId: attribute.id, searchString, type: 'text' })
      }
      continue
    }
    const allowed = new Set(attribute.options.map((option) => option.value))
    const valueIds = [...new Set(values.filter((value) => allowed.has(value)))]
    if (valueIds.length) {
      filters.push({ attributeId: attribute.id, type: 'list', valueIds })
    }
  }
  return {
    attributes,
    filters: mapIssueFilters(filters),
  }
}
