export type Result<Value, Failure> = { error: Failure; ok: false } | { ok: true; value: Value }

export function ok<Value>(value: Value): Result<Value, never> {
  return { ok: true, value }
}

export function err<Failure>(error: Failure): Result<never, Failure> {
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
