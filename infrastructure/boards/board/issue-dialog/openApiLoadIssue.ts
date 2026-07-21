import { createApiClient } from '#infrastructure/api/client'
import { mapIssueDialog } from '#infrastructure/boards/board/issue-dialog/mapIssueDialog'
import type { LoadIssue } from '~/sections/boards/board/components/IssueDialog/deps/loadIssue'

export const openApiLoadIssue =
  (baseUrl: string): LoadIssue =>
  async (input) => {
    const client = createApiClient(baseUrl)
    try {
      const response = await client.GET('/api/issues/{key}', {
        params: { path: { key: input.issueKey } },
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
        ? ok({ IssueDialog: mapIssueDialog(response.data, baseUrl) })
        : err('TemporarilyUnavailable')
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
