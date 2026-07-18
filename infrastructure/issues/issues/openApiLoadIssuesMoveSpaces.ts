import type { LoadIssuesMoveSpaces } from '../../../app/sections/issues/issues/actions/loadIssuesMoveSpaces'
import { createApiClient } from '../../api/client'
import { mapMoveOptions } from '../../shared/mapMoveOptions'

export const openApiLoadIssuesMoveSpaces = (
  baseUrl: string,
): LoadIssuesMoveSpaces => {
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

      return ok({
        spaces: mapMoveOptions(spaces.data),
      })
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
}
