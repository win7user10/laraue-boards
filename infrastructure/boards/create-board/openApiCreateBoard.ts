import type { CreateBoard } from '../../../app/sections/boards/create-board/actions/createBoard'
import { createApiClient } from '../../api/client'
import { getInvalidInputError } from '../../api/getInvalidInputError'
import { findSpaceByKey } from '../../spaces/shared/findSpaceByKey'

export const openApiCreateBoard =
  (baseUrl: string): CreateBoard =>
  async (input) => {
    const client = createApiClient(baseUrl)
    try {
      const spaces = await client.GET('/api/spaces')
      switch (spaces.response.status) {
        case 200:
          break
        case 401:
        case 403:
          return err('AccessDenied')
        default:
          return err('TemporarilyUnavailable')
      }
      const space = spaces.data && findSpaceByKey(spaces.data, input.spaceKey)
      if (!space) {
        return err('SpaceNotFound')
      }
      const response = await client.POST('/api/epics', {
        body: { color: input.color, name: input.name, spaceId: space.id },
        parseAs: 'text',
      })
      switch (response.response.status) {
        case 400:
          return err(getInvalidInputError(response.error))
        case 401:
        case 403:
          return err('AccessDenied')
        case 404:
          return err('SpaceNotFound')
        default:
          break
      }
      if (response.data === undefined) {
        return err('TemporarilyUnavailable')
      }
      return ok({ boardId: String(response.data) })
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
