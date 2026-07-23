export type ActionFailure = { type: 'failed' }

export type Result<Value, Failure = ActionFailure> =
  | { error: Failure; ok: false }
  | { ok: true; value: Value }

export const ok = <Value>(value: Value): Result<Value, never> => ({ ok: true, value })

export const err = <Failure>(error: Failure): Result<never, Failure> => ({ error, ok: false })

export const failed = (): Result<never> => err({ type: 'failed' })

export const matchResult = <Value, Failure, OkOutput, ErrorOutput>(
  result: Result<Value, Failure>,
  handlers: {
    err: (error: Failure) => ErrorOutput
    ok: (value: Value) => OkOutput
  },
): ErrorOutput | OkOutput => (result.ok ? handlers.ok(result.value) : handlers.err(result.error))
