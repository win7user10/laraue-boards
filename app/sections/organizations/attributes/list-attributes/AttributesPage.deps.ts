import type { Result } from '~/utils/actionResult'

export type AttributeListItem = {
  color: string
  id: string
  name: string
  type: 'list' | 'text'
}

export type ViewAttributesFailure = { type: 'accessDenied' } | { type: 'temporarilyUnavailable' }

export type AttributesPageDeps = {
  view: (input: {
    signal?: AbortSignal
  }) => Promise<Result<AttributeListItem[], ViewAttributesFailure>>
}
