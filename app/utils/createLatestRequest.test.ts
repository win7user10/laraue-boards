import { assert, test } from 'vitest'

import { createLatestRequest } from './createLatestRequest'

test('ignores a stale request result', async () => {
  const runLatest = createLatestRequest()
  let finishFirst: (value: string) => void = () => undefined
  const first = runLatest({
    request: () =>
      new Promise<string>((resolve) => {
        finishFirst = resolve
      }),
  })
  const second = runLatest({ request: async () => 'second' })

  finishFirst('first')

  assert.equal(await first, null)
  assert.equal(await second, 'second')
})

test('ignores a canceled request result', async () => {
  const runLatest = createLatestRequest()
  const request = runLatest({ request: async () => 'result' })

  runLatest.cancel()

  assert.equal(await request, null)
})

test('handles only the latest request result', async () => {
  const runLatest = createLatestRequest()
  const handled: string[] = []
  let finishFirst: (value: string) => void = () => undefined
  const first = runLatest({
    onLatest: (result) => handled.push(result),
    request: () =>
      new Promise<string>((resolve) => {
        finishFirst = resolve
      }),
  })
  const second = runLatest({
    onLatest: (result) => handled.push(result),
    request: async () => 'second',
  })

  finishFirst('first')
  await Promise.all([first, second])

  assert.deepEqual(handled, ['second'])
})
