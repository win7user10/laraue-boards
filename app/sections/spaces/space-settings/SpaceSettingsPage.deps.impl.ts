import type { ApiClient } from '#infrastructure/api/client'
import { getInvalidInputError } from '#infrastructure/api/getInvalidInputError'
import { findSpaceByKey } from '#infrastructure/spaces/shared/findSpaceByKey'
import type {
  ChangeSpaceFailure,
  SpaceSettingsPageDeps,
  UpdateSpaceFailure,
  ViewSpaceSettingsFailure,
} from '~/sections/spaces/space-settings/SpaceSettingsPage.deps'
import { err, ok } from '~/utils/actionResult'

const mapViewFailure = (
  status: number,
): undefined | ViewSpaceSettingsFailure => {
  if (status === 401 || status === 403) {
    return { type: 'accessDenied' }
  }
  if (status === 404) {
    return { type: 'spaceNotFound' }
  }
  if (status >= 500) {
    return { type: 'temporarilyUnavailable' }
  }
}

const mapChangeFailure = (status: number): ChangeSpaceFailure | undefined =>
  mapViewFailure(status)

const mapUpdateFailure = (
  status: number,
  error: unknown,
): undefined | UpdateSpaceFailure =>
  status === 400
    ? { message: getInvalidInputError(error).message, type: 'invalidInput' }
    : mapChangeFailure(status)

export function createSpaceSettingsPageDeps(
  client: ApiClient,
): SpaceSettingsPageDeps {
  return {
    async delete({ spaceId }) {
      const response = await client.DELETE('/api/spaces/{id}', {
        params: { path: { id: Number(spaceId) } },
      })
      if ('data' in response) {
        return ok(null)
      }
      const failure = mapChangeFailure(response.response.status)
      if (failure) {
        return err(failure)
      }
      throw new Error(
        `Unrecognized delete space response: ${response.response.status}`,
      )
    },

    async update(input) {
      const response = await client.PUT('/api/spaces/{id}', {
        body: {
          color: input.color,
          id: input.spaceId,
          key: input.key,
          name: input.name,
        },
        params: { path: { id: Number(input.spaceId) } },
      })
      if ('data' in response) {
        return ok(null)
      }
      const failure = mapUpdateFailure(response.response.status, response.error)
      if (failure) {
        return err(failure)
      }
      throw new Error(
        `Unrecognized update space response: ${response.response.status}`,
      )
    },

    async view({ signal, spaceKey }) {
      const spaces = await client.GET('/api/spaces', { signal })
      if ('error' in spaces) {
        const failure = mapViewFailure(spaces.response.status)
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

      const details = await client.GET('/api/spaces/{id}', {
        params: { path: { id: Number(space.id) } },
        signal,
      })
      if ('error' in details) {
        const failure = mapViewFailure(details.response.status)
        if (failure) {
          return err(failure)
        }
        throw new Error(
          `Unrecognized space details response: ${details.response.status}`,
        )
      }
      return ok({
        canDelete: details.data.canDelete,
        canUpdate: details.data.canUpdate,
        color: space.color,
        id: String(space.id),
        name: space.name,
        spaceKey,
      })
    },
  }
}
