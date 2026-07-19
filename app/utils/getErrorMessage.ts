export const getErrorMessage = <Error extends InvalidInputError | PropertyKey>({
  error,
  messages,
}: {
  error: Error
  messages: Record<NoInfer<Extract<Error, PropertyKey>>, string>
}) =>
  typeof error === 'object'
    ? error.message
    : messages[error as Extract<Error, PropertyKey>]
