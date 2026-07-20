import { createApiClient } from '#infrastructure/api/client'
import { mapMoveOptions } from '#infrastructure/shared/mapMoveOptions'
import type { LoadMoveSpaces } from '~/components/issues/issue-details/deps/loadMoveSpaces'

export const openApiLoadMoveSpaces = (baseUrl: string): LoadMoveSpaces => {
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
