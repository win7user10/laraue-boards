import { createApiClient } from '#infrastructure/api/client'
import { mapMoveOptions } from '#infrastructure/shared/mapMoveOptions'
import type { LoadMoveSpaces } from '~/components/issues/issue-list/deps/loadMoveSpaces'

export const openApiLoadMoveSpaces = (baseUrl: string): LoadMoveSpaces => {
  const client = createApiClient(baseUrl)
  return async () => {
    try {
      const response = await client.GET('/api/spaces')
      switch (response.response.status) {
        case 200:
          break
        case 401:
        case 403:
          return err('AccessDenied')
        default:
          return err('TemporarilyUnavailable')
      }
      return response.data
        ? ok({ spaces: mapMoveOptions(response.data) })
        : err('TemporarilyUnavailable')
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
}
