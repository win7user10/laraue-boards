import { assert, test } from 'vitest'

import { tryRequest } from './tryRequest'

test('turns a thrown request into an empty response', async () => {
  assert.equal(await tryRequest(async () => 'ok'), 'ok')
  assert.isUndefined(
    await tryRequest(async () => {
      throw new TypeError('network failed')
    }),
  )
})
