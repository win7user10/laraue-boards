import { createApiClient } from '#infrastructure/api/client'
import { getInvalidInputError } from '#infrastructure/api/getInvalidInputError'
import { mapIssueAttributeValues } from '#infrastructure/issues/shared/issueAttributes'
import { updateIssueFormData } from '#infrastructure/issues/shared/issueFormData'
import type { UpdateIssue } from '~/sections/issues/issue/deps/updateIssue'

export const openApiUpdateIssue =
  (baseUrl: string): UpdateIssue =>
  async (input) => {
    const client = createApiClient(baseUrl)
    try {
      const attributeValues = mapIssueAttributeValues(input.attributeValues)
      const response = await client.PUT('/api/issues/{key}', {
        body: {},
        bodySerializer: () =>
          updateIssueFormData({ ...input, attributeValues }),
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
      if (!response.response.ok) {
        return err('TemporarilyUnavailable')
      }
      return ok(null)
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
