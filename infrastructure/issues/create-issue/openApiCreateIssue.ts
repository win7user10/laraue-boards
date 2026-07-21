import { createApiClient } from '#infrastructure/api/client'
import { getInvalidInputError } from '#infrastructure/api/getInvalidInputError'
import { mapIssueAttributeValues } from '#infrastructure/issues/shared/issueAttributes'
import type { CreateIssue } from '~/sections/issues/create-issue/deps/createIssue'

export const openApiCreateIssue = (baseUrl: string): CreateIssue => {
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
