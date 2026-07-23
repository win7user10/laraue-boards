import type { ApiClient } from '#infrastructure/api/client'
import { failed, ok } from '~/utils/actionResult'

import type { MoveIssue } from '../moveIssue'
import { tryRequest } from './tryRequest'

export const createMoveIssue =
  (client: ApiClient): MoveIssue =>
  async ({ issueKey, statusId }) => {
    if (!statusId) {
      return failed()
    }

    const response = await tryRequest(() =>
      client.POST('/api/movement/issue/{key}/move-to-status/{statusId}', {
        params: {
          path: { key: issueKey, statusId: Number(statusId) },
        },
      }),
    )

    return response && 'data' in response ? ok(undefined) : failed()
  }
