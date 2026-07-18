import type { DeleteIssue } from '../../../app/sections/boards/board/actions/deleteIssue'
import { createApiClient } from '../../api/client'

export const openApiDeleteIssue =
  (baseUrl: string): DeleteIssue =>
  async ({ issueId }) => {
    const client = createApiClient(baseUrl)
    try {
      const response = await client.DELETE('/api/issues/{id}', {
        params: { path: { id: Number(issueId) } },
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
