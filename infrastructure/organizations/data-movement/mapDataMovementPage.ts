import type { components } from '#infrastructure/api/generated'
import { COLORS } from '~/constants/colors'
import type { ViewDataMovementPageResult } from '~/sections/organizations/data-movement/deps/viewDataMovementPage'

type Schemas = components['schemas']

const mapOptions = (items: Array<{ id: number | string; name: string }>) =>
  items.map((item) => ({ label: item.name, value: String(item.id) }))
export function mapDataMovementPage(
  current: { id: number | string },
  organizations: Schemas['OrganizationListDto'][],
  spaces: Schemas['SpaceListDto'][],
  destinationSpaces: Schemas['DestinationSpace'][],
  boardsBySpace: Schemas['EpicListDto'][][],
): ViewDataMovementPageResult {
  return {
    DataMovementPage: {
      currentOrganizationId: String(current.id),
      currentSpaces: mapOptions(destinationSpaces),
      organizations: mapOptions(organizations),
      spaceOrganizations: mapOptions(
        organizations.filter(
          (organization) =>
            organization.id !== current.id && organization.canCreateSpaces,
        ),
      ),
      spaces: spaces.map((space, index) => ({
        boards: boardsBySpace[index]!.filter((board) => !board.isDefault).map(
          (board) => ({
            color: board.color ?? COLORS.gray,
            id: String(board.id),
            name: board.name,
          }),
        ),
        color: space.color,
        id: String(space.id),
        isDefault: space.isDefault,
        name: space.name,
      })),
    },
  }
}
