import type { CreateBoardIssue } from '../../../app/sections/boards/create-issue/actions/createBoardIssue'
import { createApiClient } from '../../api/client'
import { getInvalidInputError } from '../../api/getInvalidInputError'
import { mapIssueAttributeValues } from '../../issues/shared/issueAttributes'

export const openApiCreateBoardIssue = (baseUrl: string): CreateBoardIssue => {
  const client = createApiClient(baseUrl)
  return async ({ assigneeId, attributeValues, content, statusId }) => {
    try {
      const response = await client.POST('/api/issues', {
        body: {
          assigneeId,
          attributeValues: mapIssueAttributeValues(attributeValues),
          content: content.trim(),
          statusId,
        },
        parseAs: 'text',
      })
      switch (response.response.status) {
        case 200:
          break
        case 400:
          return err(getInvalidInputError(response.error))
        case 401:
        case 403:
          return err('AccessDenied')
        case 404:
          return err('StatusNotFound')
        default:
          return err('TemporarilyUnavailable')
      }
      return response.data === undefined
        ? err('TemporarilyUnavailable')
        : ok({ issueKey: String(response.data) })
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
}
