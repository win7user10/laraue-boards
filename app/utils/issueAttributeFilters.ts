import type { LocationQuery, LocationQueryRaw } from 'vue-router'

const prefix = 'attribute.'

type AttributeFilterValues = Record<string, string | string[]>
type AttributeFilterInput =
  | { attributeId: string; searchString: string; type: 'text' }
  | { attributeId: string; type: 'list'; valueIds: string[] }
type IssueAttribute =
  | { id: string; type: 'text' }
  | {
      id: string
      options: Array<{ value: string }>
      type: 'list'
    }

export function readIssueAttributeQuery(query: LocationQuery) {
  return Object.fromEntries(
    Object.entries(query).flatMap(([key, value]) => {
      if (!key.startsWith(prefix)) {
        return []
      }
      const values = (Array.isArray(value) ? value : [value]).filter(
        (item): item is string => typeof item === 'string' && item.length > 0,
      )
      return values.length ? [[key.slice(prefix.length), values]] : []
    }),
  )
}

export function readIssueSpaceQuery(value: LocationQuery['space'] | undefined) {
  return [
    ...new Set(
      (Array.isArray(value) ? value : [value]).filter(
        (item): item is string => typeof item === 'string' && item.length > 0,
      ),
    ),
  ]
}

export function normalizeIssueAttributeFilters(
  raw: Record<string, string[]>,
  attributes: IssueAttribute[],
): AttributeFilterValues {
  const result: AttributeFilterValues = {}
  for (const attribute of attributes) {
    const values = raw[attribute.id] ?? []
    if (attribute.type === 'text') {
      const value = values.at(-1)?.trim()
      if (value) {
        result[attribute.id] = value
      }
      continue
    }
    const allowed = new Set(attribute.options.map((option) => option.value))
    const selected = [...new Set(values.filter((value) => allowed.has(value)))]
    if (selected.length) {
      result[attribute.id] = selected
    }
  }
  return result
}

export function getIssueAttributeFilterInput(
  values: AttributeFilterValues,
  attributes: IssueAttribute[],
): AttributeFilterInput[] {
  const result: AttributeFilterInput[] = []
  for (const attribute of attributes) {
    const value = values[attribute.id]
    if (
      attribute.type === 'text' &&
      typeof value === 'string' &&
      value.trim()
    ) {
      result.push({
        attributeId: attribute.id,
        searchString: value.trim(),
        type: 'text',
      })
    }
    if (attribute.type === 'list' && Array.isArray(value) && value.length) {
      result.push({ attributeId: attribute.id, type: 'list', valueIds: value })
    }
  }
  return result
}

export function withIssueAttributeFilters(
  query: LocationQuery,
  values: AttributeFilterValues,
  attributes: IssueAttribute[],
): LocationQueryRaw {
  const next = Object.fromEntries(
    Object.entries(query).filter(([key]) => !key.startsWith(prefix)),
  )
  delete next.page
  delete next.filters
  for (const attribute of attributes) {
    const value = values[attribute.id]
    if (
      attribute.type === 'text' &&
      typeof value === 'string' &&
      value.trim()
    ) {
      next[`${prefix}${attribute.id}`] = value.trim()
    } else if (
      attribute.type === 'list' &&
      Array.isArray(value) &&
      value.length
    ) {
      next[`${prefix}${attribute.id}`] = value
    }
  }
  return next
}
