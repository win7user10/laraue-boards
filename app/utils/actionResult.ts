export type Result<Value, Failure> =
  | { error: Failure; ok: false }
  | { ok: true; value: Value }

export type ActionResult<Value, Failure> = Result<Value, Failure>

export type InvalidInputError = {
  message: string
  type: 'InvalidInput'
}

export function ok<Value>(value: Value): ActionResult<Value, never> {
  return { ok: true, value }
}

export function err<Failure>(error: Failure): ActionResult<never, Failure> {
  return { error, ok: false }
}

export function matchResult<Value, Failure, OkOutput, ErrorOutput>(
  result: Result<Value, Failure>,
  handlers: {
    err: (error: Failure) => ErrorOutput
    ok: (value: Value) => OkOutput
  },
): ErrorOutput | OkOutput {
  return result.ok ? handlers.ok(result.value) : handlers.err(result.error)
}

export function matchActionResult<Value, Failure, Output>({
  err: onError,
  ok: onSuccess,
  result,
}: {
  err: (error: Failure) => Output
  ok: (value: Value) => Output
  result: ActionResult<Value, Failure>
}): Output {
  return matchResult(result, { err: onError, ok: onSuccess })
}
