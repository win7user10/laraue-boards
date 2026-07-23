import type { Result } from '~/utils/actionResult'

export type Attribute = {
  color: string
  data:
    | { listValues: Array<{ id: string; name: string }>; type: 'list' }
    | { type: 'text' }
  id: string
  name: string
}

export type UpdateAttributeInput = {
  color: string
  data:
    | { listValues: Array<{ id: null | string; name: string }>; type: 'list' }
    | { type: 'text' }
  id: string
  name: string
}

export type ViewAttributeFailure =
  | { type: 'accessDenied' }
  | { type: 'attributeNotFound' }
  | { type: 'temporarilyUnavailable' }

export type ChangeAttributeFailure =
  | ViewAttributeFailure
  | { message: string; type: 'invalidInput' }

export type AttributePageDeps = {
  delete: (input: { id: string }) => Promise<Result<void, ViewAttributeFailure>>
  update: (
    input: UpdateAttributeInput,
  ) => Promise<Result<void, ChangeAttributeFailure>>
  view: (input: {
    attributeId: string
    signal?: AbortSignal
  }) => Promise<Result<Attribute, ViewAttributeFailure>>
}
