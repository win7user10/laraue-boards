import type { ApiClient } from '#infrastructure/api/client'
import { getInvalidInputError } from '#infrastructure/api/getInvalidInputError'
import { getFirstStatusId } from '#infrastructure/issues/shared/firstStatusId'
import {
  mapIssueAttributes,
  mapIssueAttributeValues,
} from '#infrastructure/issues/shared/issueAttributes'
import { createIssueFormData } from '#infrastructure/issues/shared/issueFormData'
import { mapOrganizationAssignees } from '#infrastructure/issues/shared/mapOrganizationAssignees'
import { findSpaceByKey } from '#infrastructure/spaces/shared/findSpaceByKey'
import type {
  CreateBoardIssueFailure,
  CreateBoardIssuePageDeps,
  LoadBoardAssigneesFailure,
  ViewBoardIssueFailure,
} from '~/sections/boards/create-issue/CreateBoardIssuePage.deps'
import { err, ok } from '~/utils/actionResult'

const mapViewFailure = (status: number): undefined | ViewBoardIssueFailure => {
  if (status === 401 || status === 403) {
    return { type: 'accessDenied' }
  }
  if (status === 404) {
    return { type: 'boardNotFound' }
  }
  if (status >= 500) {
    return { type: 'temporarilyUnavailable' }
  }
}

const mapAccessFailure = (
  status: number,
): undefined | ViewBoardIssueFailure => {
  if (status === 401 || status === 403) {
    return { type: 'accessDenied' }
  }
  if (status >= 500) {
    return { type: 'temporarilyUnavailable' }
  }
}

const mapLoadFailure = (
  status: number,
): LoadBoardAssigneesFailure | undefined => {
  if (status === 401 || status === 403) {
    return { type: 'accessDenied' }
  }
  if (status === 404) {
    return { type: 'spaceNotFound' }
  }
  if (status >= 500) {
    return { type: 'temporarilyUnavailable' }
  }
}

const mapCreateFailure = (
  status: number,
  error: unknown,
): CreateBoardIssueFailure | undefined => {
  if (status === 400) {
    return {
      message: getInvalidInputError(error).message,
      type: 'invalidInput',
    }
  }
  if (status === 401 || status === 403) {
    return { type: 'accessDenied' }
  }
  if (status === 404) {
    return { type: 'statusNotFound' }
  }
  if (status >= 500) {
    return { type: 'temporarilyUnavailable' }
  }
}

export function createCreateBoardIssuePageDeps(
  client: ApiClient,
): CreateBoardIssuePageDeps {
  return {
    async create(input) {
      const response = await client.POST('/api/issues', {
        body: {},
        bodySerializer: () =>
          createIssueFormData({
            ...input,
            attributeValues: mapIssueAttributeValues(input.attributeValues),
          }),
        parseAs: 'text',
      })
      if ('error' in response) {
        const failure = mapCreateFailure(
          response.response.status,
          response.error,
        )
        if (failure) {
          return err(failure)
        }
        throw new Error(
          `Unrecognized create issue response: ${response.response.status}`,
        )
      }
      return ok({ issueKey: String(response.data) })
    },

    async loadAssignees({ spaceKey }) {
      const spaces = await client.GET('/api/spaces')
      if ('error' in spaces) {
        const failure = mapLoadFailure(spaces.response.status)
        if (failure) {
          return err(failure)
        }
        throw new Error(
          `Unrecognized spaces response: ${spaces.response.status}`,
        )
      }
      const space = findSpaceByKey(spaces.data, spaceKey)
      if (!space) {
        return err({ type: 'spaceNotFound' })
      }

      const response = await client.GET('/api/spaces/{id}/members', {
        params: { path: { id: Number(space.id) } },
      })
      if ('error' in response) {
        const failure = mapLoadFailure(response.response.status)
        if (failure) {
          return err(failure)
        }
        throw new Error(
          `Unrecognized space members response: ${response.response.status}`,
        )
      }
      return ok(mapOrganizationAssignees(response.data))
    },

    async view({ boardId, signal }) {
      const [board, attributes] = await Promise.all([
        client.GET('/api/epics/{id}', {
          params: { path: { id: Number(boardId) } },
          signal,
        }),
        client.GET('/api/organizations/attributes', { signal }),
      ])
      if ('error' in board) {
        const failure = mapViewFailure(board.response.status)
        if (failure) {
          return err(failure)
        }
        throw new Error(`Unrecognized board response: ${board.response.status}`)
      }
      if ('error' in attributes) {
        const failure = mapAccessFailure(attributes.response.status)
        if (failure) {
          return err(failure)
        }
        throw new Error(
          `Unrecognized attributes response: ${attributes.response.status}`,
        )
      }
      if (!board.data.canCreateIssues) {
        return err({ type: 'accessDenied' })
      }
      const statuses = board.data.statuses ?? []
      return ok({
        attributes: mapIssueAttributes(attributes.data),
        boardName: board.data.name,
        statuses: statuses
          .toSorted(
            (left, right) => Number(left.sortOrder) - Number(right.sortOrder),
          )
          .map((status) => ({
            label: status.name,
            value: String(status.id),
          })),
        statusId: getFirstStatusId(statuses) ?? '',
      })
    },
  }
}
