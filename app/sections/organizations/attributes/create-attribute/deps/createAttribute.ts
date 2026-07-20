type CreateAttributeResult = { id: string }
type CreateAttributeError =
  | 'AccessDenied'
  | 'TemporarilyUnavailable'
  | InvalidInputError

export type CreateAttributeInput = {
  color: string
  data: { listValues: string[]; type: 'list' } | { type: 'text' }
  name: string
}

export type CreateAttribute = (
  input: CreateAttributeInput,
) => Promise<ActionResult<CreateAttributeResult, CreateAttributeError>>
