import { createApiClient } from '#infrastructure/api/client'
import type { DeleteIssue } from '~/sections/boards/board/components/IssueDialog/deps/deleteIssue'

export const openApiDeleteIssue =
  (baseUrl: string): DeleteIssue =>
  async ({ issueKey }) => {
    const client = createApiClient(baseUrl)
    try {
      const response = await client.DELETE('/api/issues/{key}', {
        params: { path: { key: issueKey } },
      })
      switch (response.response.status) {
        case 401:
        case 403:
          return err('AccessDenied')
        case 404:
          return err('IssueNotFound')
        default:
          break
      }
      return response.response.ok ? ok(null) : err('TemporarilyUnavailable')
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
