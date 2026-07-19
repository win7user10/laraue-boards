import type { UpdateIssue } from '../../../app/sections/boards/board/actions/updateIssue'
import { createApiClient } from '../../api/client'
import { getInvalidInputError } from '../../api/getInvalidInputError'
import { mapIssueAttributeValues } from '../../issues/shared/issueAttributes'

export const openApiUpdateIssue =
  (baseUrl: string): UpdateIssue =>
  async (input) => {
    const client = createApiClient(baseUrl)
    try {
      const response = await client.PUT('/api/issues/{key}', {
        body: {
          assigneeId: input.assigneeId,
          attributeValues: mapIssueAttributeValues(input.attributeValues),
          content: input.content,
        },
        params: { path: { key: input.issueKey } },
      })
      switch (response.response.status) {
        case 400:
          return err(getInvalidInputError(response.error))
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
