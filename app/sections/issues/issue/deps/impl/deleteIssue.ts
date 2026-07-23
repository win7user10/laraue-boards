import type { ApiClient } from '#infrastructure/api/client'
import { failed, ok } from '~/utils/actionResult'

import type { DeleteIssue } from '../deleteIssue'
import { tryRequest } from './tryRequest'

export const createDeleteIssue =
  (client: ApiClient): DeleteIssue =>
  async ({ issueKey }) => {
    const response = await tryRequest(() =>
      client.DELETE('/api/issues/{key}', {
        params: { path: { key: issueKey } },
      }),
    )

    return response && 'data' in response ? ok(undefined) : failed()
  }
