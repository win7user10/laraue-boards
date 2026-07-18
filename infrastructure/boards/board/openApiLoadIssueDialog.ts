import type { LoadIssueDialog } from '../../../app/sections/boards/board/actions/loadIssueDialog'
import { createApiClient } from '../../api/client'
import { mapIssueDialog } from './mapIssueDialog'

export const openApiLoadIssueDialog =
  (baseUrl: string): LoadIssueDialog =>
  async (input) => {
    const client = createApiClient(baseUrl)
    try {
      const response = await client.GET('/api/issues/{id}', {
        params: { path: { id: Number(input.issueId) } },
      })
      switch (response.response.status) {
        case 200:
          break
        case 401:
        case 403:
          return err('AccessDenied')
        case 404:
          return err('IssueNotFound')
        default:
          return err('TemporarilyUnavailable')
      }
      return response.data
        ? ok({ IssueDialog: mapIssueDialog(response.data) })
        : err('TemporarilyUnavailable')
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
