import { assert, test } from 'vitest'

import { dataKeys, matchesDataScope } from '~/utils/dataCache'

test('groups data keys by invalidation scope', () => {
  assert.equal(dataKeys.board.view('5'), 'board:5:view')
  assert.equal(dataKeys.issue.dialog('7'), 'issue:7:dialog')
  assert.equal(matchesDataScope('board:5:view', 'issues'), true)
  assert.equal(matchesDataScope('issue:7:dialog', 'issues'), true)
  assert.equal(matchesDataScope('space:2:settings', 'issues'), false)
  assert.equal(matchesDataScope('space:2:settings', 'structure'), true)
  assert.equal(matchesDataScope('organizations:list', 'structure'), false)
})
