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
  CreateBacklogIssueFailure,
  CreateBacklogIssuePageDeps,
  LoadBacklogAssigneesFailure,
  ViewBacklogIssueFailure,
} from '~/sections/spaces/create-backlog-issue/CreateBacklogIssuePage.deps'
import { err, ok } from '~/utils/actionResult'

const mapViewFailure = (
  status: number,
  notFound: 'backlogNotFound' | 'spaceNotFound',
): undefined | ViewBacklogIssueFailure => {
  if (status === 401 || status === 403) {
    return { type: 'accessDenied' }
  }
  if (status === 404) {
    return { type: notFound }
  }
  if (status >= 500) {
    return { type: 'temporarilyUnavailable' }
  }
}

const mapAccessFailure = (
  status: number,
): undefined | ViewBacklogIssueFailure => {
  if (status === 401 || status === 403) {
    return { type: 'accessDenied' }
  }
  if (status >= 500) {
    return { type: 'temporarilyUnavailable' }
  }
}

const mapLoadFailure = (
  status: number,
): LoadBacklogAssigneesFailure | undefined => {
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
): CreateBacklogIssueFailure | undefined => {
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

export function createCreateBacklogIssuePageDeps(
  client: ApiClient,
): CreateBacklogIssuePageDeps {
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

    async loadAssignees({ spaceId }) {
      const response = await client.GET('/api/spaces/{id}/members', {
        params: { path: { id: Number(spaceId) } },
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

    async view({ signal, spaceKey }) {
      const [spaces, attributes] = await Promise.all([
        client.GET('/api/spaces', { signal }),
        client.GET('/api/organizations/attributes', { signal }),
      ])
      if ('error' in spaces) {
        const failure = mapAccessFailure(spaces.response.status)
        if (failure) {
          return err(failure)
        }
        throw new Error(
          `Unrecognized spaces response: ${spaces.response.status}`,
        )
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
      const space = findSpaceByKey(spaces.data, spaceKey)
      if (!space) {
        return err({ type: 'spaceNotFound' })
      }

      const boards = await client.GET('/api/spaces/{id}/epics', {
        params: { path: { id: Number(space.id) } },
        signal,
      })
      if ('error' in boards) {
        const failure = mapViewFailure(boards.response.status, 'spaceNotFound')
        if (failure) {
          return err(failure)
        }
        throw new Error(
          `Unrecognized boards response: ${boards.response.status}`,
        )
      }
      const backlog = boards.data.find((board) => board.isDefault)
      if (!backlog) {
        return err({ type: 'backlogNotFound' })
      }

      const board = await client.GET('/api/epics/{id}', {
        params: { path: { id: Number(backlog.id) } },
        signal,
      })
      if ('error' in board) {
        const failure = mapViewFailure(board.response.status, 'backlogNotFound')
        if (failure) {
          return err(failure)
        }
        throw new Error(
          `Unrecognized backlog response: ${board.response.status}`,
        )
      }
      if (!board.data.canCreateIssues) {
        return err({ type: 'accessDenied' })
      }
      return ok({
        attributes: mapIssueAttributes(attributes.data),
        boardName: backlog.name,
        spaceId: String(space.id),
        statusId: getFirstStatusId(board.data.statuses ?? []) ?? '',
      })
    },
  }
}
