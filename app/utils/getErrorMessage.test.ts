import { assert, test } from 'vitest'

import { getErrorMessage } from '~/utils/getErrorMessage'

test('gets an exhaustively described error message', () => {
  const error = 'AccessDenied' as 'AccessDenied' | 'TemporarilyUnavailable'
  assert.equal(
    getErrorMessage({
      error,
      messages: {
        AccessDenied: 'Access denied',
        TemporarilyUnavailable: 'Try again',
      },
    }),
    'Access denied',
  )
  assert.equal(
    getErrorMessage({
      error: {
        message: 'Key is too long.',
        type: 'InvalidInput',
      } as 'AccessDenied' | InvalidInputError,
      messages: { AccessDenied: 'Access denied' },
    }),
    'Key is too long.',
  )
})
