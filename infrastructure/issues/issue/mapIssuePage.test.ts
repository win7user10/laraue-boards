import { assert, test } from 'vitest'

import { mapIssuePage } from '#infrastructure/issues/issue/mapIssuePage'
import { COLORS } from '~/constants/colors'

const issue: Parameters<typeof mapIssuePage>[0] = {
  assignee: 'Assigned User',
  assigneeColor: COLORS.blue,
  assigneeId: '11111111-1111-1111-1111-111111111111',
  assigneeInitial: 'AU',
  attributeValues: [
    {
      color: COLORS.gray,
      id: 1,
      listValues: [],
      name: 'Reference',
      type: 0,
      value: 'ABC-1',
    },
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
  media: [
    {
      originalFileId: '22222222-2222-2222-2222-222222222222',
      previewFileId: '11111111-1111-1111-1111-111111111111',
      type: 0,
    },
    {
      originalFileId: '33333333-3333-3333-3333-333333333333',
      previewFileId: null,
      type: 1,
    },
  ],
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

test('maps issue dates and attributes', () => {
  const result = mapIssuePage(issue, 'https://api.example')

  assert.equal(result.createdAt, '2026-07-15T10:00:00Z')
  assert.equal(result.updatedAt, '2026-07-15T11:00:00Z')
  assert.equal(result.assigneeId, issue.assigneeId)
  assert.equal(result.assignee, 'Assigned User')
  assert.equal(result.assigneeColor, COLORS.blue)
  assert.equal(result.assigneeInitial, 'AU')
  assert.equal(result.ownerColor, COLORS.purple)
  assert.deepEqual(result.attachments, [
    {
      originalUrl:
        'https://api.example/api/files/22222222-2222-2222-2222-222222222222',
      previewUrl:
        'https://api.example/api/files/11111111-1111-1111-1111-111111111111',
    },
  ])
  assert.deepEqual(result.attributes, [
    {
      color: COLORS.gray,
      id: '1',
      name: 'Reference',
      type: 'text',
      value: 'ABC-1',
    },
    {
      color: COLORS.amber,
      id: '2',
      name: 'Priority',
      options: [{ label: 'High', value: '3' }],
      type: 'list',
      value: '3',
    },
  ])
})
