export async function tryRequest<Response>(
  request: () => Promise<Response>,
): Promise<Response | undefined> {
  try {
    return await request()
  } catch {
    // ponytail: client throws are local action failures; preserve causes if diagnostics need them.
    return undefined
  }
}
