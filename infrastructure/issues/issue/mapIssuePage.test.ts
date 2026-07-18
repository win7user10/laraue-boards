import assert from 'node:assert/strict'

import { test } from 'vitest'

import { mapIssuePage } from './mapIssuePage'

const issue: Parameters<typeof mapIssuePage>[0] = {
  assignee: 'Assigned User',
  assigneeId: '11111111-1111-1111-1111-111111111111',
  assigneeInitial: 'AU',
  attributeValues: [
    {
      color: '#111111',
      id: 1,
      listValues: [],
      name: 'Reference',
      type: 0,
      value: 'ABC-1',
    },
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

test('maps issue dates and attributes', () => {
  const result = mapIssuePage(issue)

  assert.equal(result.createdAt, '2026-07-15T10:00:00Z')
  assert.equal(result.updatedAt, '2026-07-15T11:00:00Z')
  assert.equal(result.assigneeId, issue.assigneeId)
  assert.equal(result.assignee, 'Assigned User')
  assert.equal(result.assigneeInitial, 'AU')
  assert.deepEqual(result.attributes, [
    {
      color: '#111111',
      id: '1',
      name: 'Reference',
      type: 'text',
      value: 'ABC-1',
    },
    {
      color: '#222222',
      id: '2',
      name: 'Priority',
      options: [{ label: 'High', value: '3' }],
      type: 'list',
      value: '3',
    },
  ])
})
