type DeleteAttributeResult = null
type DeleteAttributeError =
  | 'AccessDenied'
  | 'AttributeNotFound'
  | 'TemporarilyUnavailable'

export type DeleteAttribute = (input: {
  id: string
}) => Promise<ActionResult<DeleteAttributeResult, DeleteAttributeError>>
