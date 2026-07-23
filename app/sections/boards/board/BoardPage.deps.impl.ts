import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import { getInvalidInputError } from '#infrastructure/api/getInvalidInputError'
import { getFirstStatusId } from '#infrastructure/issues/shared/firstStatusId'
import {
  mapIssueAttributeValues,
  mapIssueFilters,
  mapRawIssueFilters,
} from '#infrastructure/issues/shared/issueAttributes'
import { updateIssueFormData } from '#infrastructure/issues/shared/issueFormData'
import { createdAtDescending } from '#infrastructure/issues/shared/issueSorting'
import { mapOrganizationAssignees } from '#infrastructure/issues/shared/mapOrganizationAssignees'
import { findSpaceByKey } from '#infrastructure/spaces/shared/findSpaceByKey'
import type { BoardPageDeps } from '~/sections/boards/board/BoardPage.deps'
import type { BoardPageViewModel } from '~/sections/boards/board/BoardPage.vue'
import type { IssueDialogViewModel } from '~/sections/boards/board/components/IssueDialog/IssueDialog.vue'
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
    issueCount: columnIssues.reduce(
      (sum, column) => sum + Number(column.items.totalCount ?? 0),
      0,
    ),
  },
})

const mapBoardPage = (
  boardId: string,
  board: Schemas['EpicDto'],
  columnIssues: Schemas['ColumnIssues'][],
  attributes: BoardPageViewModel['attributes'],
) => {
  const issues = mapBoardIssues(columnIssues).BoardPage
  const issuesByStatus = new Map(
    issues.columns.map((column) => [column.id, column]),
  )
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

const mapDialogAttribute = (
  attribute: Schemas['DetailIssueAttributeDto'],
): IssueDialogViewModel['attributes'][number] => {
  const base = {
    color: attribute.color,
    id: String(attribute.id),
    name: attribute.name,
    value: attribute.value,
  }
  switch (attribute.type) {
    case 0:
      return { ...base, type: 'text' }
    case 1:
      return {
        ...base,
        options: attribute.listValues.map((option) => ({
          label: option.name,
          value: String(option.id),
        })),
        type: 'list',
      }
    default:
      throw new RangeError(`Unsupported attribute type: ${attribute.type}`)
  }
}

const mapDialogAttachments = (
  attachments: Schemas['AttachmentData'][],
  baseUrl: string,
): IssueDialogViewModel['attachments'] =>
  attachments.flatMap((attachment) => {
    if (attachment.type !== 0) {
      return []
    }
    const previewId = attachment.previewFileId ?? attachment.originalFileId
    if (!previewId) {
      return []
    }
    const originalId = attachment.originalFileId ?? previewId
    const fileUrl = (id: string) =>
      new URL(`/api/files/${encodeURIComponent(id)}`, baseUrl).href
    return [
      {
        id: attachment.id,
        originalUrl: fileUrl(originalId),
        previewUrl: fileUrl(previewId),
      },
    ]
  })

const mapIssueDialog = (
  issue: Schemas['IssueDetailDto'],
  baseUrl: string,
): IssueDialogViewModel => ({
  assignee: issue.assignee,
  assigneeColor: issue.assigneeColor,
  assigneeId: issue.assigneeId,
  assigneeInitial: issue.assigneeInitial,
  attachments: mapDialogAttachments(issue.attachments, baseUrl),
  attributes: issue.attributeValues.map(mapDialogAttribute),
  boardId: String(issue.epicId),
  boardLabel: issue.epicName ?? '',
  canEdit: issue.canEdit,
  content: issue.content ?? '',
  createdAt: issue.time,
  issueKey: issue.key,
  owner: issue.ownerDisplayName ?? 'Unknown owner',
  ownerColor: issue.ownerColor,
  ownerInitial: issue.ownerInitials ?? '?',
  spaceId: String(issue.spaceId),
  spaceLabel: issue.spaceName,
  statusId: String(issue.statusId),
  statusLabel: issue.statusName ?? '',
  updatedAt: issue.updatedAt,
})

export function createBoardPageDeps(client: ApiClient): BoardPageDeps {
  const moveBoardIssue: BoardPageDeps['moveBoardIssue'] = async ({
    issueKey,
    statusId,
  }) => {
    if (!statusId) {
      return err('InvalidStatus')
    }
    const response = await client.POST(
      '/api/movement/issue/{key}/move-to-status/{statusId}',
      {
        params: { path: { key: issueKey, statusId: Number(statusId) } },
      },
    )
    switch (response.response.status) {
      case 200:
        return ok(null)
      case 400:
        return err('InvalidStatus')
      case 401:
      case 403:
        return err('AccessDenied')
      case 404:
        return err('ResourceNotFound')
      default:
        return err('TemporarilyUnavailable')
    }
  }

  return {
    issueDialog: {
      async deleteIssue({ issueKey }) {
        const response = await client.DELETE('/api/issues/{key}', {
          params: { path: { key: issueKey } },
        })
        switch (response.response.status) {
          case 200:
          case 204:
            return ok(null)
          case 401:
          case 403:
            return err('AccessDenied')
          case 404:
            return err('IssueNotFound')
          default:
            return err('TemporarilyUnavailable')
        }
      },
      issueDetails: {
        async loadAssignees({ spaceId }) {
          const response = await client.GET('/api/spaces/{id}/members', {
            params: { path: { id: Number(spaceId) } },
          })
          switch (response.response.status) {
            case 200:
              return response.data
                ? ok({
                    assignees: mapOrganizationAssignees(response.data),
                  })
                : err('TemporarilyUnavailable')
            case 401:
            case 403:
              return err('AccessDenied')
            case 404:
              return err('SpaceNotFound')
            default:
              return err('TemporarilyUnavailable')
          }
        },
        async loadMoveBoards({ spaceId }) {
          const response = await client.GET('/api/spaces/{id}/epics', {
            params: { path: { id: Number(spaceId) } },
          })
          switch (response.response.status) {
            case 200:
              return response.data
                ? ok({
                    boards: response.data.map((board) => ({
                      label: board.name,
                      value: String(board.id),
                    })),
                  })
                : err('TemporarilyUnavailable')
            case 401:
            case 403:
              return err('AccessDenied')
            case 404:
              return err('SpaceNotFound')
            default:
              return err('TemporarilyUnavailable')
          }
        },
        async loadMoveSpaces() {
          const response = await client.GET('/api/spaces')
          switch (response.response.status) {
            case 200:
              return response.data
                ? ok({
                    spaces: response.data.map((space) => ({
                      label: space.name,
                      value: String(space.id),
                    })),
                  })
                : err('TemporarilyUnavailable')
            case 401:
            case 403:
              return err('AccessDenied')
            default:
              return err('TemporarilyUnavailable')
          }
        },
        async loadStatuses({ boardId }) {
          const response = await client.GET('/api/epics/{id}', {
            params: { path: { id: Number(boardId) } },
          })
          switch (response.response.status) {
            case 200:
              return response.data
                ? ok({
                    statuses: (response.data.statuses ?? [])
                      .toSorted(
                        (a, b) => Number(a.sortOrder) - Number(b.sortOrder),
                      )
                      .map((status) => ({
                        id: String(status.id),
                        name: status.name,
                      })),
                  })
                : err('TemporarilyUnavailable')
            case 401:
            case 403:
              return err('AccessDenied')
            case 404:
              return err('BoardNotFound')
            default:
              return err('TemporarilyUnavailable')
          }
        },
      },
      async loadIssue({ issueKey }) {
        const response = await client.GET('/api/issues/{key}', {
          params: { path: { key: issueKey } },
        })
        switch (response.response.status) {
          case 200:
            return response.data
              ? ok({
                  IssueDialog: mapIssueDialog(response.data, client.baseUrl),
                })
              : err('TemporarilyUnavailable')
          case 401:
          case 403:
            return err('AccessDenied')
          case 404:
            return err('IssueNotFound')
          default:
            return err('TemporarilyUnavailable')
        }
      },
      moveIssue: moveBoardIssue,
      async updateIssue(input) {
        const response = await client.PUT('/api/issues/{key}', {
          body: {},
          bodySerializer: () =>
            updateIssueFormData({
              ...input,
              attributeValues: mapIssueAttributeValues(input.attributeValues),
            }),
          params: { path: { key: input.issueKey } },
        })
        switch (response.response.status) {
          case 200:
          case 204:
            return ok(null)
          case 400:
            return err(getInvalidInputError(response.error))
          case 401:
          case 403:
            return err('AccessDenied')
          case 404:
            return err('IssueNotFound')
          default:
            return err('TemporarilyUnavailable')
        }
      },
    },

    async loadMoreBoardIssues({ filters, offset, search, statusId, take }) {
      const response = await client.POST(
        '/api/issues/by-status/{statusId}/search',
        {
          body: {
            filters: mapIssueFilters(filters),
            searchString: search || undefined,
            skip: offset,
            sorting: createdAtDescending,
            take,
          },
          params: { path: { statusId: Number(statusId) } },
        },
      )
      switch (response.response.status) {
        case 200:
          return response.data
            ? ok({
                hasNext: response.data.hasNext ?? false,
                issues: response.data.data.map(mapIssueListItem),
              })
            : err('TemporarilyUnavailable')
        case 401:
        case 403:
          return err('AccessDenied')
        default:
          return err('TemporarilyUnavailable')
      }
    },

    moveBoardIssue,

    async moveIssueToBacklog({ boardId, issueKey, spaceKey }) {
      const spaces = await client.GET('/api/spaces')
      if (spaces.response.status === 401 || spaces.response.status === 403) {
        return err('AccessDenied')
      }
      if (spaces.response.status !== 200 || !spaces.data) {
        return err('TemporarilyUnavailable')
      }
      const space = findSpaceByKey(spaces.data, spaceKey)
      if (!space) {
        return err('ResourceNotFound')
      }
      const boards = await client.GET('/api/spaces/{id}/epics', {
        params: { path: { id: Number(space.id) } },
      })
      if (boards.response.status === 401 || boards.response.status === 403) {
        return err('AccessDenied')
      }
      if (boards.response.status === 404) {
        return err('ResourceNotFound')
      }
      if (boards.response.status !== 200 || !boards.data) {
        return err('TemporarilyUnavailable')
      }
      if (!boards.data.some((board) => String(board.id) === boardId)) {
        return err('ResourceNotFound')
      }
      const backlog = boards.data.find((board) => board.isDefault)
      if (!backlog) {
        return err('ResourceNotFound')
      }
      if (String(backlog.id) === boardId) {
        return err('AlreadyInBacklog')
      }
      const backlogBoard = await client.GET('/api/epics/{id}', {
        params: { path: { id: Number(backlog.id) } },
      })
      if (
        backlogBoard.response.status === 401 ||
        backlogBoard.response.status === 403
      ) {
        return err('AccessDenied')
      }
      if (backlogBoard.response.status === 404) {
        return err('ResourceNotFound')
      }
      if (backlogBoard.response.status !== 200 || !backlogBoard.data) {
        return err('TemporarilyUnavailable')
      }
      const statusId = getFirstStatusId(backlogBoard.data.statuses ?? [])
      if (!statusId) {
        return err('TemporarilyUnavailable')
      }
      const response = await client.POST(
        '/api/movement/issue/{key}/move-to-status/{statusId}',
        {
          params: {
            path: { key: issueKey, statusId: Number(statusId) },
          },
        },
      )
      switch (response.response.status) {
        case 200:
          return ok(null)
        case 401:
        case 403:
          return err('AccessDenied')
        case 404:
          return err('ResourceNotFound')
        default:
          return err('TemporarilyUnavailable')
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
            : err('TemporarilyUnavailable')
        case 401:
        case 403:
          return err('AccessDenied')
        case 404:
          return err('BoardNotFound')
        default:
          return err('TemporarilyUnavailable')
      }
    },

    async view({ attributeQuery, boardId, search, signal }) {
      const attributes = await client.GET('/api/organizations/attributes', {
        signal,
      })
      if ('data' in attributes) {
        if (attributes.data === undefined) {
          return err('TemporarilyUnavailable')
        }
        const attributeData = mapRawIssueFilters(
          attributeQuery,
          attributes.data,
        )
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
              return err('TemporarilyUnavailable')
            }
            return ok(
              mapBoardPage(
                boardId,
                board.data,
                issues.data,
                attributeData.attributes,
              ),
            )
          }
          if (
            issues.response.status === 401 ||
            issues.response.status === 403
          ) {
            return err('AccessDenied')
          }
          if (issues.response.status === 404) {
            return err('BoardNotFound')
          }
          return err('TemporarilyUnavailable')
        }
        if (board.response.status === 401 || board.response.status === 403) {
          return err('AccessDenied')
        }
        if (board.response.status === 404) {
          return err('BoardNotFound')
        }
        return err('TemporarilyUnavailable')
      }
      if (
        attributes.response.status === 401 ||
        attributes.response.status === 403
      ) {
        return err('AccessDenied')
      }
      return err('TemporarilyUnavailable')
    },
  }
}
