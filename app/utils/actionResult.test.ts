import { assert, test } from 'vitest'

import { err, matchActionResult, ok } from '~/utils/actionResult'

const match = (result: ActionResult<number, string>) =>
  matchActionResult({
    err: (error) => error,
    ok: (value) => String(value),
    result,
  })

test('matches an action result', () => {
  assert.equal(match(ok(2)), '2')
  assert.equal(match(err('failed')), 'failed')
})
