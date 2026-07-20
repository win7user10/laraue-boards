import { assert, test } from 'vitest'

import { mapViewBoardPage } from '#infrastructure/boards/board/mapViewBoardPage'
import { COLORS } from '~/constants/colors'

test('maps and orders API columns for the board page', () => {
  const board = mapViewBoardPage(
    '7',
    {
      canCreateIssues: true,
      canDeleteIssues: false,
      canUpdateIssues: true,
      color: null,
      name: 'Board',
      statuses: [
        { color: null, id: 2, name: 'Done', sortOrder: 2 },
        { color: COLORS.blue, id: 1, name: 'To do', sortOrder: 1 },
      ],
    },
    [
      {
        items: {
          data: [
            {
              assignee: 'Alex',
              assigneeColor: COLORS.indigo,
              assigneeInitial: 'A',
              content: 'Review copy',
              epicId: 7,
              id: 12,
              key: 'BRD-12',
              spaceId: 1,
              statusId: 1,
              time: '2026-07-12T09:14:00Z',
            },
          ],
          totalCount: 1,
        },
        statusId: 1,
      },
    ],
  )

  assert.equal(board.BoardPage.title, 'Board')
  assert.equal(board.BoardPage.issueCount, 1)
  assert.deepEqual(
    board.BoardPage.columns.map((column) => column.title),
    ['To do', 'Done'],
  )
  assert.equal(board.BoardPage.columns[0]?.issues[0]?.issueKey, 'BRD-12')
  assert.equal(board.BoardPage.columns[0]?.issues[0]?.assigneeName, 'Alex')
  assert.equal(board.BoardPage.canCreateIssues, true)
  assert.equal(board.BoardPage.canMoveIssues, true)
})
