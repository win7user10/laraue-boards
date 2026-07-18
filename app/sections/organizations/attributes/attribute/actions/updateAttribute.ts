type UpdateAttributeResult = null
type UpdateAttributeError =
  | 'AccessDenied'
  | 'AttributeNotFound'
  | 'TemporarilyUnavailable'
  | InvalidInputError

export type UpdateAttributeInput = {
  color: string
  data:
    | {
        listValues: Array<{ id: null | string; name: string }>
        type: 'list'
      }
    | { type: 'text' }
  id: string
  name: string
}

export type UpdateAttribute = (
  input: UpdateAttributeInput,
) => Promise<ActionResult<UpdateAttributeResult, UpdateAttributeError>>
