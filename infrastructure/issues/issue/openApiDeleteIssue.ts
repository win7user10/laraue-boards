import type { DeleteIssue } from '../../../app/sections/issues/issue/actions/deleteIssue'
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
      if (!response.response.ok) {
        return err('TemporarilyUnavailable')
      }
      return ok(null)
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
