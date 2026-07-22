import type { ApiClient } from '#infrastructure/api/client'
import { getInvalidInputError } from '#infrastructure/api/getInvalidInputError'
import {
  mapIssueAttributes,
  mapIssueAttributeValues,
} from '#infrastructure/issues/shared/issueAttributes'
import { createIssueFormData } from '#infrastructure/issues/shared/issueFormData'
import { mapOrganizationAssignees } from '#infrastructure/issues/shared/mapOrganizationAssignees'
import type {
  CreateIssueFailure,
  CreateIssuePageDeps,
  LoadSpaceDataFailure,
  LoadStatusesFailure,
  ViewCreateIssueFailure,
} from '~/sections/issues/create-issue/CreateIssuePage.deps'
import { err, ok } from '~/utils/actionResult'

const mapAccessFailure = (
  status: number,
): undefined | ViewCreateIssueFailure => {
  if (status === 401 || status === 403) {
    return { type: 'accessDenied' }
  }
  if (status >= 500) {
    return { type: 'temporarilyUnavailable' }
  }
}

const mapSpaceFailure = (status: number): LoadSpaceDataFailure | undefined => {
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

const mapStatusFailure = (status: number): LoadStatusesFailure | undefined => {
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

const mapCreateFailure = (
  status: number,
  error: unknown,
): CreateIssueFailure | undefined => {
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

export function createCreateIssuePageDeps(
  client: ApiClient,
): CreateIssuePageDeps {
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
        const failure = mapSpaceFailure(response.response.status)
        if (failure) {
          return err(failure)
        }
        throw new Error(
          `Unrecognized space members response: ${response.response.status}`,
        )
      }
      return ok(mapOrganizationAssignees(response.data))
    },

    async loadBoards({ spaceId }) {
      const response = await client.GET('/api/spaces/{id}/epics', {
        params: { path: { id: Number(spaceId) } },
      })
      if ('error' in response) {
        const failure = mapSpaceFailure(response.response.status)
        if (failure) {
          return err(failure)
        }
        throw new Error(
          `Unrecognized space boards response: ${response.response.status}`,
        )
      }
      return ok({
        boardId: String(
          response.data.find((board) => board.isDefault)?.id ??
            response.data[0]?.id ??
            '',
        ),
        boards: response.data.map((board) => ({
          label: board.name,
          value: String(board.id),
        })),
      })
    },

    async loadStatuses({ boardId }) {
      const response = await client.GET('/api/epics/{id}', {
        params: { path: { id: Number(boardId) } },
      })
      if ('error' in response) {
        const failure = mapStatusFailure(response.response.status)
        if (failure) {
          return err(failure)
        }
        throw new Error(
          `Unrecognized board response: ${response.response.status}`,
        )
      }
      if (!response.data.canCreateIssues) {
        return err({ type: 'accessDenied' })
      }
      return ok(
        (response.data.statuses ?? [])
          .toSorted(
            (left, right) => Number(left.sortOrder) - Number(right.sortOrder),
          )
          .map((status) => ({
            label: status.name,
            value: String(status.id),
          })),
      )
    },

    async view({ signal }) {
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
          `Unrecognized create issue page response: ${spaces.response.status}`,
        )
      }
      if ('error' in attributes) {
        const failure = mapAccessFailure(attributes.response.status)
        if (failure) {
          return err(failure)
        }
        throw new Error(
          `Unrecognized create issue page response: ${attributes.response.status}`,
        )
      }
      const spaceOptions = spaces.data.map((space) => {
        if (space.id === undefined) {
          throw new TypeError('Space id is required')
        }
        return { label: space.name, value: String(space.id) }
      })
      return ok({
        attributes: mapIssueAttributes(attributes.data),
        boardId: '',
        boards: [],
        spaceId: spaceOptions[0]?.value ?? '',
        spaces: spaceOptions,
        statuses: [],
        statusId: '',
      })
    },
  }
}
