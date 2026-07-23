import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import {
  mapIssueFilters,
  mapRawIssueFilters,
} from '#infrastructure/issues/shared/issueAttributes'
import { createdAtDescending } from '#infrastructure/issues/shared/issueSorting'
import { COLORS } from '~/constants/colors'
import type {
  IssuesPageDeps,
  IssuesPageIssue,
  LoadMoveBoardsFailure,
  LoadMoveStatusesFailure,
  MoveIssuesFailure,
  ViewIssuesFailure,
} from '~/sections/issues/issues/IssuesPage.deps'
import { err, ok } from '~/utils/actionResult'

type Schemas = components['schemas']

const mapIssue = (issue: Schemas['SearchIssueDto']): IssuesPageIssue => ({
  assignee: issue.assignee,
  assigneeColor: issue.assigneeColor,
  assigneeInitial: issue.assigneeInitial ?? '?',
  boardColor: issue.epic.color,
  boardName: issue.epic.name,
  canMove: issue.canEdit,
  content: issue.content ?? '',
  issueKey: issue.key,
  spaceColor: issue.space.color,
  spaceName: issue.space.name,
  status: issue.status?.name ?? 'Backlog',
  statusColor: issue.status?.color ?? COLORS.gray,
})

const mapViewFailure = (status: number): undefined | ViewIssuesFailure => {
  if (status === 401 || status === 403) {
    return { type: 'accessDenied' }
  }
  if (status >= 500) {
    return { type: 'temporarilyUnavailable' }
  }
}

const mapBoardsFailure = (
  status: number,
): LoadMoveBoardsFailure | undefined => {
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

const mapStatusesFailure = (
  status: number,
): LoadMoveStatusesFailure | undefined => {
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

const mapMoveFailure = (status: number): MoveIssuesFailure | undefined => {
  if (status === 400) {
    return { type: 'invalidStatus' }
  }
  if (status === 401 || status === 403) {
    return { type: 'accessDenied' }
  }
  if (status === 404) {
    return { type: 'resourceNotFound' }
  }
  if (status >= 500) {
    return { type: 'temporarilyUnavailable' }
  }
}

export function createIssuesPageDeps(client: ApiClient): IssuesPageDeps {
  return {
    async loadMoveBoards({ spaceId }) {
      const response = await client.GET('/api/spaces/{id}/epics', {
        params: { path: { id: Number(spaceId) } },
      })
      if ('data' in response && response.data !== undefined) {
        return ok({
          boards: response.data.map((board) => ({
            label: board.name,
            value: String(board.id),
          })),
        })
      }
      if ('data' in response) {
        return err({ type: 'temporarilyUnavailable' })
      }
      const failure = mapBoardsFailure(response.response.status)
      if (failure) {
        return err(failure)
      }
      throw new Error(
        `Unrecognized move boards response: ${response.response.status}`,
      )
    },

    async loadMoveSpaces() {
      const response = await client.GET('/api/spaces')
      if ('data' in response && response.data !== undefined) {
        return ok({
          spaces: response.data.map((space) => ({
            label: space.name,
            value: String(space.id),
          })),
        })
      }
      if ('data' in response) {
        return err({ type: 'temporarilyUnavailable' })
      }
      const failure = mapViewFailure(response.response.status)
      if (failure) {
        return err(failure)
      }
      throw new Error(
        `Unrecognized move spaces response: ${response.response.status}`,
      )
    },

    async loadMoveStatuses({ boardId }) {
      const response = await client.GET('/api/epics/{id}', {
        params: { path: { id: Number(boardId) } },
      })
      if ('data' in response && response.data !== undefined) {
        return ok({
          statuses: (response.data.statuses ?? [])
            .toSorted((a, b) => Number(a.sortOrder) - Number(b.sortOrder))
            .map((status) => ({ id: String(status.id), name: status.name })),
        })
      }
      if ('data' in response) {
        return err({ type: 'temporarilyUnavailable' })
      }
      const failure = mapStatusesFailure(response.response.status)
      if (failure) {
        return err(failure)
      }
      throw new Error(
        `Unrecognized move statuses response: ${response.response.status}`,
      )
    },

    async moveIssues({ issueKeys, statusId }) {
      if (issueKeys.length === 0 || statusId === '') {
        return err({ type: 'invalidStatus' })
      }
      const responses = await Promise.all(
        issueKeys.map((issueKey) =>
          client.POST('/api/movement/issue/{key}/move-to-status/{statusId}', {
            params: {
              path: { key: issueKey, statusId: Number(statusId) },
            },
          }),
        ),
      )
      for (const response of responses) {
        if ('data' in response) {
          continue
        }
        const failure = mapMoveFailure(response.response.status)
        if (failure) {
          return err(failure)
        }
        throw new Error(
          `Unrecognized move issue response: ${response.response.status}`,
        )
      }
      return ok(undefined)
    },

    async search({ filters, page, search, spaceIds }) {
      const response = await client.POST('/api/issues/search', {
        body: {
          filters: mapIssueFilters(filters),
          page: page - 1,
          perPage: 10,
          searchString: search || undefined,
          sorting: createdAtDescending,
          spaceIds: spaceIds.length ? spaceIds : undefined,
        },
      })
      if ('data' in response && response.data !== undefined) {
        return ok({
          hasNextPage: response.data.hasNextPage,
          issues: response.data.data.map(mapIssue),
        })
      }
      if ('data' in response) {
        return err({ type: 'temporarilyUnavailable' })
      }
      const failure = mapViewFailure(response.response.status)
      if (failure) {
        return err(failure)
      }
      throw new Error(
        `Unrecognized issues search response: ${response.response.status}`,
      )
    },

    async view({ attributeQuery, page, search, signal, spaceIds }) {
      const attributes = await client.GET('/api/organizations/attributes', {
        signal,
      })
      if ('error' in attributes) {
        const failure = mapViewFailure(attributes.response.status)
        if (failure) {
          return err(failure)
        }
        throw new Error(
          `Unrecognized attributes response: ${attributes.response.status}`,
        )
      }
      if (attributes.data === undefined) {
        return err({ type: 'temporarilyUnavailable' })
      }
      const attributeData = mapRawIssueFilters(attributeQuery, attributes.data)
      const [issues, spaces] = await Promise.all([
        client.POST('/api/issues/search', {
          body: {
            filters: attributeData.filters,
            page: page - 1,
            perPage: 10,
            searchString: search || undefined,
            sorting: createdAtDescending,
            spaceIds: spaceIds.length ? spaceIds : undefined,
          },
          signal,
        }),
        client.GET('/api/spaces', { signal }),
      ])
      if ('error' in issues) {
        const failure = mapViewFailure(issues.response.status)
        if (failure) {
          return err(failure)
        }
        throw new Error(
          `Unrecognized issues response: ${issues.response.status}`,
        )
      }
      if ('error' in spaces) {
        const failure = mapViewFailure(spaces.response.status)
        if (failure) {
          return err(failure)
        }
        throw new Error(
          `Unrecognized spaces response: ${spaces.response.status}`,
        )
      }
      if (issues.data === undefined || spaces.data === undefined) {
        return err({ type: 'temporarilyUnavailable' })
      }
      return ok({
        attributes: attributeData.attributes,
        hasNextPage: issues.data.hasNextPage,
        issues: issues.data.data.map(mapIssue),
        spaces: spaces.data.flatMap((space) =>
          space.id === undefined
            ? []
            : [{ label: space.name, value: String(space.id) }],
        ),
      })
    },
  }
}
