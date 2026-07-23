import { assert, test } from 'vitest'

import { err, failed, matchResult, ok } from '~/utils/actionResult'
import type { Result } from '~/utils/actionResult'

const match = (result: Result<number, string>) =>
  matchResult(result, {
    err: (error) => error,
    ok: (value) => String(value),
  })

test('matches an action result', () => {
  assert.equal(match(ok(2)), '2')
  assert.equal(match(err('failed')), 'failed')
  assert.deepEqual(failed(), { error: { type: 'failed' }, ok: false })
})
