export const createLatestRequest = () => {
  let latestId = 0

  const run = async <T>({
    onLatest,
    request,
  }: {
    onLatest?: (result: T) => void
    request: () => Promise<T>
  }): Promise<null | T> => {
    const requestId = ++latestId
    const result = await request()
    if (requestId !== latestId) {
      return null
    }
    onLatest?.(result)
    return result
  }

  return Object.assign(run, { cancel: () => latestId++ })
}
