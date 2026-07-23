import { assert, test } from 'vitest'

import { mapIssueDialog } from '#infrastructure/boards/board/issue-dialog/mapIssueDialog'
import { COLORS } from '~/constants/colors'

const issue: Parameters<typeof mapIssueDialog>[0] = {
  assignee: 'Assigned User',
  assigneeColor: COLORS.blue,
  assigneeId: '11111111-1111-1111-1111-111111111111',
  assigneeInitial: 'AU',
  attachments: [],
  attributeValues: [
    {
      color: COLORS.amber,
      id: 2,
      listValues: [{ id: 3, name: 'High' }],
      name: 'Priority',
      type: 1,
      value: '3',
    },
  ],
  canEdit: true,
  content: 'Fix the issue',
  epicColor: COLORS.coral,
  epicId: 4,
  epicName: 'Board',
  id: 5,
  key: 'DEV-1',
  ownerColor: COLORS.purple,
  ownerDisplayName: 'User',
  ownerInitials: 'U',
  spaceColor: COLORS.cyan,
  spaceId: 6,
  spaceName: 'Development',
  statusColor: COLORS.emerald,
  statusId: 7,
  statusName: 'In progress',
  time: '2026-07-15T10:00:00Z',
  updatedAt: '2026-07-15T11:00:00Z',
}

test('maps a board issue dialog independently', () => {
  const result = mapIssueDialog(issue, 'https://api.example')

  assert.equal(result.issueKey, 'DEV-1')
  assert.equal(result.assignee, 'Assigned User')
  assert.equal(result.assigneeColor, COLORS.blue)
  assert.equal(result.ownerColor, COLORS.purple)
  assert.equal(result.attributes[0]?.type, 'list')
})
