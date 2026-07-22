import type { Result } from '~/utils/actionResult'
import { matchResult } from '~/utils/actionResult'

export type AsyncResultState<Value, Failure> =
  | { data: Value; type: 'ready' }
  | { error: Failure; message: string; type: 'error' }
  | { type: 'pending' }

export function toAsyncResultState<Value, Failure>({
  error,
  getErrorMessage,
  result,
  status,
}: {
  error: unknown
  getErrorMessage: (failure: Failure) => string
  result: null | Result<Value, Failure> | undefined
  status: 'error' | 'idle' | 'pending' | 'success'
}): AsyncResultState<Value, Failure> {
  if (status === 'idle' || status === 'pending') {
    return { type: 'pending' }
  }
  if (status === 'error') {
    throw error ?? new Error('Async data failed without an error')
  }
  if (!result) {
    throw new Error('Async data succeeded without a Result')
  }
  return matchResult(result, {
    err: (failure) => ({
      error: failure,
      message: getErrorMessage(failure),
      type: 'error' as const,
    }),
    ok: (data) => ({ data, type: 'ready' as const }),
  })
}
