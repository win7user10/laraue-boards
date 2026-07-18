import type { LoadIssueMoveSpaces } from '../../../app/sections/issues/issue/actions/loadIssueMoveSpaces'
import { createApiClient } from '../../api/client'
import { mapMoveOptions } from '../../shared/mapMoveOptions'

export const openApiLoadIssueMoveSpaces = (
  baseUrl: string,
): LoadIssueMoveSpaces => {
  const client = createApiClient(baseUrl)
  return async () => {
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
      if (!spaces.data) {
        return err('TemporarilyUnavailable')
      }
      return ok({ spaces: mapMoveOptions(spaces.data) })
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
}
