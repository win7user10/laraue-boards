export type ActionResult<Value, Failure> =
  | { error: Failure; ok: false }
  | { ok: true; value: Value }

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

export function matchActionResult<Value, Failure, Result>({
  err,
  ok,
  result,
}: {
  err: (error: Failure) => Result
  ok: (value: Value) => Result
  result: ActionResult<Value, Failure>
}): Result {
  return result.ok ? ok(result.value) : err(result.error)
}
