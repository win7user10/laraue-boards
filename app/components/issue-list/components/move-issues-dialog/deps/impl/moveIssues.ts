import type { ApiClient } from '#infrastructure/api/client'
import { tryRequest } from '#infrastructure/api/tryRequest'
import { failed, ok } from '~/utils/actionResult'

import type { MoveIssues } from '../moveIssues'

export const createMoveIssues =
  (client: ApiClient): MoveIssues =>
  async ({ issueKeys, statusId }) => {
    if (!issueKeys.length || !statusId) {
      return failed()
    }

    const responses = await tryRequest(() =>
      Promise.all(
        issueKeys.map((issueKey) =>
          client.POST('/api/movement/issue/{key}/move-to-status/{statusId}', {
            params: {
              path: { key: issueKey, statusId: Number(statusId) },
            },
          }),
        ),
      ),
    )

    return responses?.every((response) => 'data' in response) ? ok(undefined) : failed()
  }
