import type { components } from '#infrastructure/api/generated.ts'
import { COLORS } from '~/constants/colors'
import type { ViewSpacePageResult } from '~/sections/spaces/space/deps/viewSpacePage'

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
        color: board.color ?? (board.isDefault ? space.color : COLORS.gray),
        id: String(board.id),
        issueCount: board.columns.reduce(
          (sum, column) => sum + Number(column.count),
          0,
        ),
        kind: board.isDefault ? ('backlog' as const) : ('board' as const),
        name: board.isDefault ? 'Backlog' : board.name,
        statuses: board.columns.map((column) => ({
          color: column.color ?? COLORS.gray,
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
