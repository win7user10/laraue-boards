const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

export const getInvalidInputError = (value: unknown): InvalidInputError => {
  const messages =
    isRecord(value) && isRecord(value.errors)
      ? Object.values(value.errors).flatMap((errors) =>
          Array.isArray(errors)
            ? errors.filter(
                (error): error is string => typeof error === 'string',
              )
            : [],
        )
      : []

  return {
    message:
      messages.length > 0
        ? messages.join('\n')
        : 'The submitted data is invalid.',
    type: 'InvalidInput',
  }
}
