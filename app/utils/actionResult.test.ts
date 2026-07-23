import { assert, test } from 'vitest'

import { err, matchResult, ok } from '~/utils/actionResult'

const match = (result: Result<number, string>) =>
  matchResult(result, {
    err: (error) => error,
    ok: (value) => String(value),
  })

test('matches an action result', () => {
  assert.equal(match(ok(2)), '2')
  assert.equal(match(err('failed')), 'failed')
})
