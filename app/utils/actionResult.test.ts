import assert from 'node:assert/strict'

import { test } from 'vitest'

import { err, matchActionResult, ok } from './actionResult'

test('matches an action result', () => {
  const match = (result: ActionResult<number, string>) =>
    matchActionResult({
      err: (error) => error,
      ok: (value) => String(value),
      result,
    })

  assert.equal(match(ok(2)), '2')
  assert.equal(match(err('failed')), 'failed')
})
