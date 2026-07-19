import { assert, test } from 'vitest'

import { mapIssueDialog } from './mapIssueDialog'

const issue: Parameters<typeof mapIssueDialog>[0] = {
  assignee: 'Assigned User',
  assigneeId: '11111111-1111-1111-1111-111111111111',
  assigneeInitial: 'AU',
  attributeValues: [
    {
      color: '#222222',
      id: 2,
      listValues: [{ id: 3, name: 'High' }],
      name: 'Priority',
      type: 1,
      value: '3',
    },
  ],
  canEdit: true,
  content: 'Fix the issue',
  epicColor: '#333333',
  epicId: 4,
  epicName: 'Board',
  id: 5,
  key: 'DEV-1',
  ownerDisplayName: 'User',
  ownerInitials: 'U',
  spaceColor: '#444444',
  spaceId: 6,
  spaceName: 'Development',
  statusColor: '#555555',
  statusId: 7,
  statusName: 'In progress',
  time: '2026-07-15T10:00:00Z',
  updatedAt: '2026-07-15T11:00:00Z',
}

test('maps a board issue dialog independently', () => {
  const result = mapIssueDialog(issue)

  assert.equal(result.issueKey, 'DEV-1')
  assert.equal(result.assignee, 'Assigned User')
  assert.equal(result.attributes[0]?.type, 'list')
})
