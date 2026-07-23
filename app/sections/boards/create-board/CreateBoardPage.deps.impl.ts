import type { ApiClient } from '#infrastructure/api/client'
import { getInvalidInputError } from '#infrastructure/api/getInvalidInputError'
import type {
  CreateBoardFailure,
  CreateBoardPageDeps,
} from '~/sections/boards/create-board/CreateBoardPage.deps'
import { findSpaceByKey } from '~/sections/spaces/shared/findSpaceByKey'
import { err, ok } from '~/utils/actionResult'

const mapSpacesFailure = (status: number): CreateBoardFailure | undefined => {
  if (status === 401 || status === 403) {
    return { type: 'accessDenied' }
  }
  if (status >= 500) {
    return { type: 'temporarilyUnavailable' }
  }
}

const mapCreateFailure = (status: number, error: unknown): CreateBoardFailure | undefined => {
  if (status === 400) {
    return {
      message: getInvalidInputError(error).message,
      type: 'invalidInput',
    }
  }
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

export function createCreateBoardPageDeps(client: ApiClient): CreateBoardPageDeps {
  return {
    async create(input) {
      const spaces = await client.GET('/api/spaces')
      if ('data' in spaces && spaces.data) {
        const space = findSpaceByKey(spaces.data, input.spaceKey)
        if (!space) {
          return err({ type: 'spaceNotFound' })
        }

        const response = await client.POST('/api/epics', {
          body: { color: input.color, name: input.name, spaceId: space.id },
          parseAs: 'text',
        })
        if ('data' in response) {
          return ok({ boardId: String(response.data) })
        }
        const failure = mapCreateFailure(response.response.status, response.error)
        if (failure) {
          return err(failure)
        }
        throw new Error(`Unrecognized create board response: ${response.response.status}`)
      }
      const failure = mapSpacesFailure(spaces.response.status)
      if (failure) {
        return err(failure)
      }
      throw new Error(`Unrecognized spaces response: ${spaces.response.status}`)
    },
  }
}
