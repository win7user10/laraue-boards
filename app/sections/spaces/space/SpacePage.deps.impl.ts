import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import { COLORS } from '~/constants/colors'
import { findSpaceByKey } from '~/sections/spaces/shared/findSpaceByKey'
import type {
  SpacePageData,
  SpacePageDeps,
  ViewSpaceFailure,
} from '~/sections/spaces/space/SpacePage.deps'
import { err, ok } from '~/utils/actionResult'

type Schemas = components['schemas']

const mapPage = (
  spaceId: string,
  space: Schemas['SpaceListDto'],
  details: Schemas['SpaceDetailsDto'],
  boards: Schemas['EpicSummary'][],
): SpacePageData => ({
  boards: boards.map((board) => ({
    color: board.color ?? (board.isDefault ? space.color : COLORS.gray),
    id: String(board.id),
    issueCount: board.columns.reduce(
      (sum, column) => sum + Number(column.count),
      0,
    ),
    kind: board.isDefault ? 'backlog' : 'board',
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
})

const mapFailure = (
  status: number,
  notFound = false,
): undefined | ViewSpaceFailure => {
  if (status === 401 || status === 403) {
    return { type: 'accessDenied' }
  }
  if (notFound && status === 404) {
    return { type: 'spaceNotFound' }
  }
  if (status >= 500) {
    return { type: 'temporarilyUnavailable' }
  }
}

export function createSpacePageDeps(client: ApiClient): SpacePageDeps {
  return {
    async view({ signal, spaceKey }) {
      const spaces = await client.GET('/api/spaces', { signal })
      if ('error' in spaces) {
        const failure = mapFailure(spaces.response.status)
        if (failure) {
          return err(failure)
        }
        throw new Error(
          `Unrecognized spaces response: ${spaces.response.status}`,
        )
      }
      const space = findSpaceByKey(spaces.data, spaceKey)
      if (!space) {
        return err({ type: 'spaceNotFound' })
      }
      const spaceId = String(space.id)

      const [details, summaries] = await Promise.all([
        client.GET('/api/spaces/{id}', {
          params: { path: { id: Number(spaceId) } },
          signal,
        }),
        client.GET('/api/issues/summary', {
          params: { query: { SpaceId: Number(spaceId) } },
          signal,
        }),
      ])
      if ('error' in details) {
        const failure = mapFailure(details.response.status, true)
        if (failure) {
          return err(failure)
        }
        throw new Error(
          `Unrecognized space details response: ${details.response.status}`,
        )
      }
      if ('error' in summaries) {
        const failure = mapFailure(summaries.response.status, true)
        if (failure) {
          return err(failure)
        }
        throw new Error(
          `Unrecognized issue summaries response: ${summaries.response.status}`,
        )
      }
      return ok(mapPage(spaceId, space, details.data, summaries.data))
    },
  }
}
