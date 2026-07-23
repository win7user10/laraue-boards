import type { components } from '#infrastructure/api/generated'

type Schemas = components['schemas']

export const createdAtDescending = {
  $type: 'property' as const,
  direction: 1,
  property: 1,
} satisfies Schemas['IssueSorting']
