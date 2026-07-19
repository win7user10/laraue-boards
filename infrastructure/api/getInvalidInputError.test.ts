import { assert, test } from 'vitest'

import { getInvalidInputError } from './getInvalidInputError'

test('reads backend validation messages', () => {
  assert.deepEqual(
    getInvalidInputError({
      errors: {
        Key: ['Key is too long.'],
        Name: ['Name is required.'],
      },
    }),
    {
      message: 'Key is too long.\nName is required.',
      type: 'InvalidInput',
    },
  )
  assert.deepEqual(getInvalidInputError({ title: 'Bad request' }), {
    message: 'The submitted data is invalid.',
    type: 'InvalidInput',
  })
})
