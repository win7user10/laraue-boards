export const tryRequest = async <Response>(
  request: () => Promise<Response>,
): Promise<Response | undefined> => {
  try {
    return await request()
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') {
      throw cause
    }
    // client throws are local action failures; preserve causes if diagnostics need them.
    return undefined
  }
}
