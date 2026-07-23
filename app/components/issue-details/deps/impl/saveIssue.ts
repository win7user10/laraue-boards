import type { ApiClient } from '#infrastructure/api/client'
import { getInvalidInputError } from '#infrastructure/api/getInvalidInputError'
import { tryRequest } from '#infrastructure/api/tryRequest'
import { mapIssueAttributeValues } from '~/sections/issues/shared/api/issueAttributes'
import { updateIssueFormData } from '~/sections/issues/shared/api/issueFormData'
import { err, failed, ok } from '~/utils/actionResult'

import type { IssueDetailsSavedIssue, SaveIssue } from '../saveIssue'

export const createSaveIssue =
  (client: ApiClient): SaveIssue =>
  async (input) => {
    const response = await tryRequest(() =>
      client.PUT('/api/issues/{key}', {
        body: {},
        bodySerializer: () =>
          updateIssueFormData({
            ...input,
            attributeValues: mapIssueAttributeValues(input.attributeValues),
          }),
        params: { path: { key: input.issueKey } },
      }),
    )

    if (!response) {
      return failed()
    }
    if (!('data' in response)) {
      return response.response.status === 400
        ? err({
            message: getInvalidInputError(response.error).message,
            type: 'invalidInput',
          })
        : failed()
    }

    const saved: IssueDetailsSavedIssue = {
      boardId: input.boardId,
      complete: true,
      content: input.content,
      issueKey: input.issueKey,
      previousBoardId: input.previousBoardId,
      previousStatusId: input.previousStatusId,
      statusId: input.statusId,
    }
    if (input.statusId === input.previousStatusId) {
      return ok(saved)
    }

    const moveResponse = await tryRequest(() =>
      client.POST('/api/movement/issue/{key}/move-to-status/{statusId}', {
        params: {
          path: { key: input.issueKey, statusId: Number(input.statusId) },
        },
      }),
    )
    if (moveResponse && 'data' in moveResponse) {
      return ok(saved)
    }

    return err({
      issue: {
        ...saved,
        boardId: input.previousBoardId,
        complete: false,
        statusId: input.previousStatusId,
      },
      type: 'partiallySaved',
    })
  }
