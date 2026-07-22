import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import { mapMoveOptions } from '#infrastructure/shared/mapMoveOptions'
import { COLORS } from '~/constants/colors'
import type {
  DataMovementPageData,
  DataMovementPageDeps,
  LoadDestinationSpacesFailure,
  MoveDataFailure,
  ViewDataMovementFailure,
} from '~/sections/organizations/data-movement/DataMovementPage.deps'
import { err, ok } from '~/utils/actionResult'

type Schemas = components['schemas']

const mapPage = (
  current: { id: number | string },
  organizations: Schemas['OrganizationListDto'][],
  spaces: Schemas['SpaceListDto'][],
  destinationSpaces: Schemas['DestinationSpace'][],
  boardsBySpace: Schemas['EpicListDto'][][],
): DataMovementPageData => ({
  currentOrganizationId: String(current.id),
  currentSpaces: mapMoveOptions(destinationSpaces),
  organizations: mapMoveOptions(organizations),
  spaceOrganizations: mapMoveOptions(
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
})

const mapViewFailure = (
  status: number,
  currentOrganization = false,
): undefined | ViewDataMovementFailure => {
  if (
    status === 401 ||
    status === 403 ||
    (currentOrganization && status === 404)
  ) {
    return { type: 'accessDenied' }
  }
  if (status === 404 || status >= 500) {
    return { type: 'temporarilyUnavailable' }
  }
}

const mapLoadFailure = (
  status: number,
): LoadDestinationSpacesFailure | undefined => {
  if (status === 401 || status === 403) {
    return { type: 'accessDenied' }
  }
  if (status === 404) {
    return { type: 'organizationNotFound' }
  }
  if (status >= 500) {
    return { type: 'temporarilyUnavailable' }
  }
}

const mapMoveFailure = (status: number): MoveDataFailure | undefined => {
  if (status === 400) {
    return { type: 'invalidDestination' }
  }
  if (status === 401 || status === 403) {
    return { type: 'accessDenied' }
  }
  if (status === 404) {
    return { type: 'resourceNotFound' }
  }
  if (status >= 500) {
    return { type: 'temporarilyUnavailable' }
  }
}

export function createDataMovementPageDeps(
  client: ApiClient,
): DataMovementPageDeps {
  return {
    async loadSpaces({ organizationId }) {
      const response = await client.GET(
        '/api/movement/organization/{id}/spaces',
        { params: { path: { id: Number(organizationId) } } },
      )
      if (!response.response.ok) {
        const failure = mapLoadFailure(response.response.status)
        if (failure) {
          return err(failure)
        }
        throw new Error(
          `Unrecognized destination spaces response: ${response.response.status}`,
        )
      }
      if (!response.data) {
        throw new Error('Destination spaces response has no data')
      }
      return ok(mapMoveOptions(response.data))
    },

    async moveBoards({ boardIds, destinationSpaceId }) {
      if (!boardIds.length || !destinationSpaceId) {
        return err({ type: 'invalidDestination' })
      }
      const responses = await Promise.all(
        boardIds.map((boardId) =>
          client.POST('/api/movement/epic/{id}/to-space/{newSpaceId}', {
            params: {
              path: {
                id: Number(boardId),
                newSpaceId: Number(destinationSpaceId),
              },
            },
          }),
        ),
      )
      for (const response of responses) {
        if (response.response.ok) {
          continue
        }
        const failure = mapMoveFailure(response.response.status)
        if (failure) {
          return err(failure)
        }
        throw new Error(
          `Unrecognized move board response: ${response.response.status}`,
        )
      }
      return ok(undefined)
    },

    async moveSpaces({ destinationOrganizationId, spaceIds }) {
      if (!destinationOrganizationId || !spaceIds.length) {
        return err({ type: 'invalidDestination' })
      }
      const responses = await Promise.all(
        spaceIds.map((spaceId) =>
          client.POST(
            '/api/movement/space/{id}/to-organization/{organizationId}',
            {
              params: {
                path: {
                  id: Number(spaceId),
                  organizationId: Number(destinationOrganizationId),
                },
              },
            },
          ),
        ),
      )
      for (const response of responses) {
        if (response.response.ok) {
          continue
        }
        const failure = mapMoveFailure(response.response.status)
        if (failure) {
          return err(failure)
        }
        throw new Error(
          `Unrecognized move space response: ${response.response.status}`,
        )
      }
      return ok(undefined)
    },

    async view({ signal }) {
      const current = await client.GET('/api/organizations/current', { signal })
      if (!current.response.ok) {
        const failure = mapViewFailure(current.response.status, true)
        if (failure) {
          return err(failure)
        }
        throw new Error(
          `Unrecognized current organization response: ${current.response.status}`,
        )
      }
      if (!current.data) {
        throw new Error('Current organization response has no data')
      }
      if (!current.data.canMassMove) {
        return err({ type: 'accessDenied' })
      }

      const responses = await Promise.all([
        client.GET('/api/organizations', { signal }),
        client.GET('/api/spaces', { signal }),
        client.GET('/api/movement/organization/{id}/spaces', {
          params: { path: { id: Number(current.data.id) } },
          signal,
        }),
      ])
      for (const response of responses) {
        if (response.response.ok) {
          continue
        }
        const failure = mapViewFailure(response.response.status)
        if (failure) {
          return err(failure)
        }
        throw new Error(
          `Unrecognized data movement response: ${response.response.status}`,
        )
      }
      const [organizations, spaces, destinationSpaces] = responses
      if (!organizations.data || !spaces.data || !destinationSpaces.data) {
        throw new Error('Data movement response has no data')
      }

      const boardResponses = await Promise.all(
        spaces.data.map((space) =>
          client.GET('/api/spaces/{id}/epics', {
            params: { path: { id: Number(space.id) } },
            signal,
          }),
        ),
      )
      for (const response of boardResponses) {
        if (response.response.ok) {
          if (!response.data) {
            throw new Error('Boards response has no data')
          }
          continue
        }
        const failure = mapViewFailure(response.response.status)
        if (failure) {
          return err(failure)
        }
        throw new Error(
          `Unrecognized boards response: ${response.response.status}`,
        )
      }

      return ok(
        mapPage(
          current.data,
          organizations.data,
          spaces.data,
          destinationSpaces.data,
          boardResponses.map((response) => response.data!),
        ),
      )
    },
  }
}
