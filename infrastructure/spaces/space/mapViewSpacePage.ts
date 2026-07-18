import type { ViewSpacePageResult } from '../../../app/sections/spaces/space/actions/viewSpacePage'
import type { components } from '../../api/generated.ts'

type Schemas = components['schemas']

export function mapViewSpacePage(
  spaceId: string,
  space: Schemas['SpaceListDto'],
  details: Schemas['SpaceDetailsDto'],
  boards: Schemas['EpicSummary'][],
): ViewSpacePageResult {
  return {
    SpacePage: {
      boards: boards.map((board) => ({
        color: board.color ?? (board.isDefault ? space.color : '#98a2b3'),
        id: String(board.id),
        issueCount: board.columns.reduce(
          (sum, column) => sum + Number(column.count),
          0,
        ),
        kind: board.isDefault ? ('backlog' as const) : ('board' as const),
        name: board.isDefault ? 'Backlog' : board.name,
        statuses: board.columns.map((column) => ({
          color: column.color ?? '#98a2b3',
          count: Number(column.count),
          name: column.name,
        })),
      })),
      canCreateBoards: details.canCreateEpics,
      canManage: details.canUpdate || details.canDelete,
      color: space.color,
      id: spaceId,
      key: space.key,
      name: space.name,
    },
  }
}
