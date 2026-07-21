export type ActionDataState<Value, Failure extends PropertyKey = PropertyKey> =
  | { data: Value; type: 'ready' }
  | { error: Failure | null; message: string; type: 'error' }
  | { type: 'pending' }

type AsyncDataStatus = 'error' | 'idle' | 'pending' | 'success'

export const resolveActionDataState = <Value, Failure extends PropertyKey>(
  result: ActionResult<Value, Failure> | null | undefined,
  status: AsyncDataStatus,
  messages: Record<NoInfer<Failure>, string>,
  fallbackMessage: string,
): ActionDataState<Value, Failure> => {
  if (result) {
    return result.ok
      ? { data: result.value, type: 'ready' }
      : { error: result.error, message: messages[result.error], type: 'error' }
  }
  return status === 'pending' || status === 'idle'
    ? { type: 'pending' }
    : { error: null, message: fallbackMessage, type: 'error' }
}

type UseActionDataOptions<Value, Failure extends PropertyKey> = {
  action: () => Promise<ActionResult<Value, Failure>>
  fallbackMessage: string
  key?: string
  messages: Record<NoInfer<Failure>, string>
  watch?: Array<() => unknown>
}

export const useActionData = async <Value, Failure extends PropertyKey>(
  {
    action,
    fallbackMessage,
    key: explicitKey,
    messages,
    watch,
  }: UseActionDataOptions<Value, Failure>,
  autoKey?: string,
) => {
  const baseKey = explicitKey ?? autoKey
  if (!baseKey) {
    throw new TypeError('useActionData requires a generated key')
  }
  const key = watch?.length
    ? computed(
        () => `${baseKey}:${JSON.stringify(watch.map((source) => source()))}`,
      )
    : baseKey
  const {
    data: actionResult,
    refresh,
    status,
  } = await useAsyncData(key, action, {})
  const state = computed(() =>
    resolveActionDataState(
      actionResult.value,
      status.value,
      messages,
      fallbackMessage,
    ),
  )

  return { actionResult, refresh, state }
}
