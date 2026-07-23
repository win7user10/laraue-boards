import { assert, expect, test } from 'vitest'

import { tryRequest } from '#infrastructure/api/tryRequest'

test('turns a thrown request into an empty response', async () => {
  assert.equal(await tryRequest(async () => 'ok'), 'ok')
  assert.isUndefined(
    await tryRequest(async () => {
      throw new TypeError('network failed')
    }),
  )
})

test('preserves request cancellation', async () => {
  await expect(
    tryRequest(async () => {
      throw new DOMException('aborted', 'AbortError')
    }),
  ).rejects.toMatchObject({ name: 'AbortError' })
})
