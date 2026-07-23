import type { ApiClient } from '#infrastructure/api/client'
import { getInvalidInputError } from '#infrastructure/api/getInvalidInputError'
import { mapIssueAttributeValues } from '~/sections/issues/shared/api/issueAttributes'
import { updateIssueFormData } from '~/sections/issues/shared/api/issueFormData'
import { err, failed, ok } from '~/utils/actionResult'

import type { UpdateIssue } from '../updateIssue'
import { tryRequest } from './tryRequest'

export const createUpdateIssue =
  (client: ApiClient): UpdateIssue =>
  async (input) => {
    const body = updateIssueFormData({
      ...input,
      attributeValues: mapIssueAttributeValues(input.attributeValues),
    })
    const response = await tryRequest(() =>
      client.PUT('/api/issues/{key}', {
        body: {},
        bodySerializer: () => body,
        params: { path: { key: input.issueKey } },
      }),
    )

    if (!response) {
      return failed()
    }
    if ('data' in response) {
      return ok(undefined)
    }
    if (response.response.status === 400) {
      return err({
        message: getInvalidInputError(response.error).message,
        type: 'invalidInput',
      })
    }
    return failed()
  }
