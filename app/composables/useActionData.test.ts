import { assert, test } from 'vitest'

import { resolveActionDataState } from '~/composables/useActionData'
import { err, ok } from '~/utils/actionResult'

const messages = { Denied: 'Access denied' } as const

test('resolves action data states', () => {
  assert.deepEqual(
    resolveActionDataState(ok(1), 'success', messages, 'Failed'),
    {
      data: 1,
      type: 'ready',
    },
  )
  assert.deepEqual(
    resolveActionDataState(
      err('Denied' as const),
      'success',
      messages,
      'Failed',
    ),
    { error: 'Denied', message: 'Access denied', type: 'error' },
  )
  assert.deepEqual(
    resolveActionDataState(undefined, 'pending', messages, 'Failed'),
    { type: 'pending' },
  )
  assert.deepEqual(
    resolveActionDataState(undefined, 'idle', messages, 'Failed'),
    { type: 'pending' },
  )
  assert.deepEqual(
    resolveActionDataState(undefined, 'error', messages, 'Failed'),
    { error: null, message: 'Failed', type: 'error' },
  )
})
