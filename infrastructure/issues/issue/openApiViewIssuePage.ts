import type { ViewIssuePage } from '../../../app/sections/issues/issue/actions/viewIssuePage'
import { createApiClient } from '../../api/client'
import { mapIssuePage } from './mapIssuePage'

export const openApiViewIssuePage =
  (baseUrl: string): ViewIssuePage =>
  async ({ issueKey }) => {
    const client = createApiClient(baseUrl)
    try {
      const issue = await client.GET('/api/issues/{key}', {
        params: { path: { key: issueKey } },
      })
      switch (issue.response.status) {
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
      if (!issue.data) {
        return err('TemporarilyUnavailable')
      }

      return ok({
        IssuePage: mapIssuePage(issue.data),
      })
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
