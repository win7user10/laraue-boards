import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import type { BoardPageDeps } from '~/sections/boards/board/BoardPage.deps'
import type { BoardPageViewModel } from '~/sections/boards/board/BoardPage.vue'
import { createIssueDialogDeps } from '~/sections/boards/board/components/IssueDialog/IssueDialog.deps.impl'
import { mapIssueFilters, mapRawIssueFilters } from '~/sections/issues/shared/api/issueAttributes'
import { createdAtDescending } from '~/sections/issues/shared/api/issueSorting'
import { findSpaceByKey } from '~/sections/spaces/shared/findSpaceByKey'
import { err, ok } from '~/utils/actionResult'

type Schemas = components['schemas']

const mapIssueListItem = (issue: Schemas['IssueListDto']) => ({
  assigneeColor: issue.assigneeColor,
  assigneeInitial: issue.assigneeInitial ?? '?',
  assigneeName: issue.assignee,
  content: issue.content ?? '',
  issueKey: issue.key,
  time: issue.time,
})

const mapBoardIssues = (columnIssues: Schemas['ColumnIssues'][]) => ({
  BoardPage: {
    columns: columnIssues.map((column) => ({
      hasNext: column.items.hasNext ?? false,
      id: String(column.statusId),
      issueCount: Number(column.items.totalCount ?? 0),
      issues: column.items.data.map(mapIssueListItem),
    })),
    issueCount: columnIssues.reduce((sum, column) => sum + Number(column.items.totalCount ?? 0), 0),
  },
})

const mapBoardPage = (
  boardId: string,
  board: Schemas['EpicDto'],
  columnIssues: Schemas['ColumnIssues'][],
  attributes: BoardPageViewModel['attributes'],
) => {
  const issues = mapBoardIssues(columnIssues).BoardPage
  const issuesByStatus = new Map(issues.columns.map((column) => [column.id, column]))
  return {
    BoardPage: {
      attributes,
      canCreateIssues: board.canCreateIssues,
      canDelete: board.canDelete ?? false,
      canMoveIssues: board.canUpdateIssues,
      canUpdate: board.canUpdate ?? false,
      color: board.color ?? null,
      columns: (board.statuses ?? [])
        .toSorted((a, b) => Number(a.sortOrder) - Number(b.sortOrder))
        .map((status) => {
          const column = issuesByStatus.get(String(status.id))
          return {
            color: status.color ?? null,
            hasNext: column?.hasNext ?? false,
            id: String(status.id),
            issueCount: column?.issueCount ?? 0,
            issues: column?.issues ?? [],
            title: status.name,
          }
        }),
      id: boardId,
      issueCount: issues.issueCount,
      title: board.name,
    },
  }
}

export const createBoardPageDeps = (client: ApiClient): BoardPageDeps => {
  const issueDialog = createIssueDialogDeps(client)

  return {
    issueDialog,

    async loadMoreBoardIssues({ filters, offset, search, statusId, take }) {
      const response = await client.POST('/api/issues/by-status/{statusId}/search', {
        body: {
          filters: mapIssueFilters(filters),
          searchString: search || undefined,
          skip: offset,
          sorting: createdAtDescending,
          take,
        },
        params: { path: { statusId: Number(statusId) } },
      })
      switch (response.response.status) {
        case 200:
          return response.data
            ? ok({
                hasNext: response.data.hasNext ?? false,
                issues: response.data.data.map(mapIssueListItem),
              })
            : err({ type: 'temporarilyUnavailable' })
        case 401:
        case 403:
          return err({ type: 'accessDenied' })
        default:
          return err({ type: 'temporarilyUnavailable' })
      }
    },

    moveBoardIssue: async ({ issueKey, statusId }) => {
      if (!statusId) {
        return err({ type: 'invalidStatus' })
      }
      const response = await client.POST('/api/movement/issue/{key}/move-to-status/{statusId}', {
        params: { path: { key: issueKey, statusId: Number(statusId) } },
      })
      switch (response.response.status) {
        case 200:
          return ok(null)
        case 400:
          return err({ type: 'invalidStatus' })
        case 401:
        case 403:
          return err({ type: 'accessDenied' })
        case 404:
          return err({ type: 'resourceNotFound' })
        default:
          return err({ type: 'temporarilyUnavailable' })
      }
    },

    async moveIssueToBacklog({ boardId, issueKey, spaceKey }) {
      const spaces = await client.GET('/api/spaces')
      if (spaces.response.status === 401 || spaces.response.status === 403) {
        return err({ type: 'accessDenied' })
      }
      if (spaces.response.status !== 200 || !spaces.data) {
        return err({ type: 'temporarilyUnavailable' })
      }
      const space = findSpaceByKey(spaces.data, spaceKey)
      if (!space) {
        return err({ type: 'resourceNotFound' })
      }
      const boards = await client.GET('/api/spaces/{id}/epics', {
        params: { path: { id: Number(space.id) } },
      })
      if (boards.response.status === 401 || boards.response.status === 403) {
        return err({ type: 'accessDenied' })
      }
      if (boards.response.status !== 200 || !boards.data) {
        return err(
          boards.response.status === 404
            ? { type: 'resourceNotFound' }
            : { type: 'temporarilyUnavailable' },
        )
      }
      const current = boards.data.find((board) => String(board.id) === boardId)
      const backlog = boards.data.find((board) => board.isDefault)
      if (!current || !backlog) {
        return err({ type: 'resourceNotFound' })
      }
      if (current.id === backlog.id) {
        return err({ type: 'alreadyInBacklog' })
      }
      const response = await client.GET('/api/epics/{id}', {
        params: { path: { id: Number(backlog.id) } },
      })
      if (response.response.status === 401 || response.response.status === 403) {
        return err({ type: 'accessDenied' })
      }
      if (response.response.status !== 200 || !response.data) {
        return err(
          response.response.status === 404
            ? { type: 'resourceNotFound' }
            : { type: 'temporarilyUnavailable' },
        )
      }
      const status = (response.data.statuses ?? []).toSorted(
        (left, right) => Number(left.sortOrder) - Number(right.sortOrder),
      )[0]
      if (!status) {
        return err({ type: 'temporarilyUnavailable' })
      }
      const moveResponse = await client.POST(
        '/api/movement/issue/{key}/move-to-status/{statusId}',
        {
          params: {
            path: { key: issueKey, statusId: Number(status.id) },
          },
        },
      )
      switch (moveResponse.response.status) {
        case 200:
          return ok(null)
        case 401:
        case 403:
          return err({ type: 'accessDenied' })
        case 404:
          return err({ type: 'resourceNotFound' })
        default:
          return err({ type: 'temporarilyUnavailable' })
      }
    },

    async searchBoardIssues({ boardId, filters, search, take }) {
      const response = await client.POST('/api/issues/board', {
        body: {
          epicId: boardId,
          filters: mapIssueFilters(filters),
          searchString: search || undefined,
          sorting: createdAtDescending,
          take,
        },
      })
      switch (response.response.status) {
        case 200:
          return response.data
            ? ok(mapBoardIssues(response.data))
            : err({ type: 'temporarilyUnavailable' })
        case 401:
        case 403:
          return err({ type: 'accessDenied' })
        case 404:
          return err({ type: 'boardNotFound' })
        default:
          return err({ type: 'temporarilyUnavailable' })
      }
    },

    async view({ attributeQuery, boardId, search, signal }) {
      const attributes = await client.GET('/api/organizations/attributes', {
        signal,
      })
      if ('data' in attributes) {
        if (attributes.data === undefined) {
          return err({ type: 'temporarilyUnavailable' })
        }
        const attributeData = mapRawIssueFilters(attributeQuery, attributes.data)
        const [board, issues] = await Promise.all([
          client.GET('/api/epics/{id}', {
            params: { path: { id: boardId } },
            signal,
          }),
          client.POST('/api/issues/board', {
            body: {
              epicId: boardId,
              filters: attributeData.filters,
              searchString: search || undefined,
              sorting: createdAtDescending,
              take: 25,
            },
            signal,
          }),
        ])
        if ('data' in board) {
          if ('data' in issues) {
            if (board.data === undefined || issues.data === undefined) {
              return err({ type: 'temporarilyUnavailable' })
            }
            return ok(mapBoardPage(boardId, board.data, issues.data, attributeData.attributes))
          }
          if (issues.response.status === 401 || issues.response.status === 403) {
            return err({ type: 'accessDenied' })
          }
          if (issues.response.status === 404) {
            return err({ type: 'boardNotFound' })
          }
          return err({ type: 'temporarilyUnavailable' })
        }
        if (board.response.status === 401 || board.response.status === 403) {
          return err({ type: 'accessDenied' })
        }
        if (board.response.status === 404) {
          return err({ type: 'boardNotFound' })
        }
        return err({ type: 'temporarilyUnavailable' })
      }
      if (attributes.response.status === 401 || attributes.response.status === 403) {
        return err({ type: 'accessDenied' })
      }
      return err({ type: 'temporarilyUnavailable' })
    },
  }
}
