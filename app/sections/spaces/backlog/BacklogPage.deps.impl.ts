import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import { createIssueListDeps } from '~/components/issue-list/deps/impl'
import { COLORS } from '~/constants/colors'
import { mapIssueFilters, mapRawIssueFilters } from '~/sections/issues/shared/api/issueAttributes'
import { createdAtDescending } from '~/sections/issues/shared/api/issueSorting'
import type {
  BacklogIssue,
  BacklogPageDeps,
  ViewBacklogFailure,
} from '~/sections/spaces/backlog/BacklogPage.deps'
import { findSpaceByKey } from '~/sections/spaces/shared/findSpaceByKey'
import { err, ok } from '~/utils/actionResult'

type Schemas = components['schemas']

const mapIssue = (issue: Schemas['SearchIssueDto']): BacklogIssue => ({
  assignee: issue.assignee,
  assigneeColor: issue.assigneeColor,
  assigneeInitial: issue.assigneeInitial ?? '?',
  boardColor: issue.epic.color,
  boardName: issue.epic.name,
  canMove: issue.canEdit,
  content: issue.content ?? '',
  issueKey: issue.key,
  status: issue.status?.name ?? 'Backlog',
  statusColor: issue.status?.color ?? COLORS.gray,
})

const mapViewFailure = (status: number, notFound = false): undefined | ViewBacklogFailure => {
  if (status === 401 || status === 403) {
    return { type: 'accessDenied' }
  }
  if (notFound && status === 404) {
    return { type: 'spaceNotFound' }
  }
  if (status >= 500) {
    return { type: 'temporarilyUnavailable' }
  }
}

export const createBacklogPageDeps = (client: ApiClient): BacklogPageDeps => ({
  issueList: createIssueListDeps(client),
  async search({ backlogBoardId, filters, page, search }) {
    const response = await client.POST('/api/issues/search', {
      body: {
        epicIds: [backlogBoardId],
        filters: mapIssueFilters(filters),
        page: page - 1,
        perPage: 10,
        searchString: search || undefined,
        sorting: createdAtDescending,
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
    const failure = mapViewFailure(response.response.status, true)
    if (failure) {
      return err(failure)
    }
    throw new Error(`Unrecognized backlog search response: ${response.response.status}`)
  },

  async view({ attributeQuery, page, search, signal, spaceKey }) {
    const [spaces, attributes] = await Promise.all([
      client.GET('/api/spaces', { signal }),
      client.GET('/api/organizations/attributes', { signal }),
    ])
    if ('error' in spaces) {
      const failure = mapViewFailure(spaces.response.status)
      if (failure) {
        return err(failure)
      }
      throw new Error(`Unrecognized spaces response: ${spaces.response.status}`)
    }
    if ('error' in attributes) {
      const failure = mapViewFailure(attributes.response.status)
      if (failure) {
        return err(failure)
      }
      throw new Error(`Unrecognized attributes response: ${attributes.response.status}`)
    }
    const space = findSpaceByKey(spaces.data, spaceKey)
    if (!space) {
      return err({ type: 'spaceNotFound' })
    }
    const attributeData = mapRawIssueFilters(attributeQuery, attributes.data)
    const boards = await client.GET('/api/spaces/{id}/epics', {
      params: { path: { id: Number(space.id) } },
      signal,
    })
    if ('error' in boards) {
      const failure = mapViewFailure(boards.response.status, true)
      if (failure) {
        return err(failure)
      }
      throw new Error(`Unrecognized backlog boards response: ${boards.response.status}`)
    }
    const backlog = boards.data.find((board) => board.isDefault)
    if (!backlog) {
      return err({ type: 'spaceNotFound' })
    }
    const issues = await client.POST('/api/issues/search', {
      body: {
        epicIds: [backlog.id],
        filters: attributeData.filters,
        page: page - 1,
        perPage: 10,
        searchString: search || undefined,
        sorting: createdAtDescending,
      },
      signal,
    })
    if ('error' in issues) {
      const failure = mapViewFailure(issues.response.status)
      if (failure) {
        return err(failure)
      }
      throw new Error(`Unrecognized backlog issues response: ${issues.response.status}`)
    }
    return ok({
      attributes: attributeData.attributes,
      backlogBoardId: String(backlog.id),
      color: space.color,
      hasNextPage: issues.data.hasNextPage,
      issues: issues.data.data.map(mapIssue),
      spaceKey,
      title: backlog.name,
    })
  },
})
