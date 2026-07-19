import { assert, test } from 'vitest'

import {
  asyncDataKeys,
  isIssueCollectionDataKey,
  isIssueRelatedDataKey,
  isSelectedOrganizationDataKey,
  isWorkspaceStructureDataKey,
} from './useAsyncDataInvalidation'

test('groups Nuxt data keys for invalidation', () => {
  assert.equal(asyncDataKeys.board.view('5'), 'board:5:view')
  assert.equal(asyncDataKeys.issue.dialog('7'), 'issue:7:dialog')
  assert.equal(asyncDataKeys.workspace.attribute('3'), 'workspace:attribute:3')
  assert.equal(asyncDataKeys.workspace.layout('2'), 'workspace:layout:2')
  assert.equal(isWorkspaceStructureDataKey('space:2:settings'), true)
  assert.equal(isIssueRelatedDataKey('space:2:backlog'), true)
  assert.equal(isIssueRelatedDataKey('space:2:view'), true)
  assert.equal(isIssueCollectionDataKey('board:5:view'), false)
  assert.equal(isIssueRelatedDataKey('space:2:settings'), false)
  assert.equal(isWorkspaceStructureDataKey('organizations:list'), false)
  assert.equal(isSelectedOrganizationDataKey('workspace:layout'), true)
  assert.equal(isSelectedOrganizationDataKey('organizations:list'), false)
})
