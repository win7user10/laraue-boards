import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import { getInvalidInputError } from '#infrastructure/api/getInvalidInputError'
import type {
  IssuePageData,
  IssuePageDeps,
  IssueResourceFailure,
  LoadBoardFailure,
  LoadSpaceFailure,
  MoveIssueFailure,
} from '~/sections/issues/issue/IssuePage.deps'
import { mapIssueAttributeValues } from '~/sections/issues/shared/api/issueAttributes'
import { updateIssueFormData } from '~/sections/issues/shared/api/issueFormData'
import { err, ok } from '~/utils/actionResult'

type Schemas = components['schemas']

const mapOrganizationAssignees = (members: Schemas['SpaceMember'][]) =>
  members.map((member) => ({
    color: member.color,
    initials: member.initials,
    label: member.displayName,
    value: member.userId,
  }))

const mapResourceFailure = (
  status: number,
): IssueResourceFailure | undefined => {
  if (status === 401 || status === 403) {
    return { type: 'accessDenied' }
  }
  if (status === 404) {
    return { type: 'issueNotFound' }
  }
  if (status >= 500) {
    return { type: 'temporarilyUnavailable' }
  }
}

const mapSpaceFailure = (status: number): LoadSpaceFailure | undefined => {
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

const mapBoardFailure = (status: number): LoadBoardFailure | undefined => {
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

const mapMoveFailure = (status: number): MoveIssueFailure | undefined => {
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

const mapAttribute = (
  attribute: Schemas['DetailIssueAttributeDto'],
): IssuePageData['attributes'][number] => {
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

const mapAttachments = (
  attachments: Schemas['AttachmentData'][],
  baseUrl: string,
): IssuePageData['attachments'] =>
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

const mapIssue = (
  issue: Schemas['IssueDetailDto'],
  baseUrl: string,
): IssuePageData => ({
  assignee: issue.assignee,
  assigneeColor: issue.assigneeColor,
  assigneeId: issue.assigneeId,
  assigneeInitial: issue.assigneeInitial,
  attachments: mapAttachments(issue.attachments, baseUrl),
  attributes: issue.attributeValues.map(mapAttribute),
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

export function createIssuePageDeps(client: ApiClient): IssuePageDeps {
  return {
    async deleteIssue({ issueKey }) {
      const response = await client.DELETE('/api/issues/{key}', {
        params: { path: { key: issueKey } },
      })
      if ('data' in response) {
        return ok(undefined)
      }
      const failure = mapResourceFailure(response.response.status)
      if (failure) {
        return err(failure)
      }
      throw new Error(
        `Unrecognized delete issue response: ${response.response.status}`,
      )
    },

    async loadAssignees({ spaceId }) {
      const response = await client.GET('/api/spaces/{id}/members', {
        params: { path: { id: Number(spaceId) } },
      })
      if ('data' in response && response.data !== undefined) {
        return ok({ assignees: mapOrganizationAssignees(response.data) })
      }
      if ('data' in response) {
        return err({ type: 'temporarilyUnavailable' })
      }
      const failure = mapSpaceFailure(response.response.status)
      if (failure) {
        return err(failure)
      }
      throw new Error(
        `Unrecognized assignees response: ${response.response.status}`,
      )
    },

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
      const failure = mapSpaceFailure(response.response.status)
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
      const failure = mapSpaceFailure(response.response.status)
      if (failure?.type === 'accessDenied') {
        return err(failure)
      }
      if (failure?.type === 'temporarilyUnavailable') {
        return err(failure)
      }
      throw new Error(
        `Unrecognized move spaces response: ${response.response.status}`,
      )
    },

    async loadStatuses({ boardId }) {
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
      const failure = mapBoardFailure(response.response.status)
      if (failure) {
        return err(failure)
      }
      throw new Error(
        `Unrecognized statuses response: ${response.response.status}`,
      )
    },

    async moveIssue({ issueKey, statusId }) {
      if (statusId === '') {
        return err({ type: 'invalidStatus' })
      }
      const response = await client.POST(
        '/api/movement/issue/{key}/move-to-status/{statusId}',
        {
          params: {
            path: { key: issueKey, statusId: Number(statusId) },
          },
        },
      )
      if ('data' in response) {
        return ok(undefined)
      }
      const failure = mapMoveFailure(response.response.status)
      if (failure) {
        return err(failure)
      }
      throw new Error(
        `Unrecognized move issue response: ${response.response.status}`,
      )
    },

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
      if ('data' in response) {
        return ok(undefined)
      }
      if (response.response.status === 400) {
        const failure = getInvalidInputError(response.error)
        return err({ message: failure.message, type: 'invalidInput' })
      }
      const failure = mapResourceFailure(response.response.status)
      if (failure) {
        return err(failure)
      }
      throw new Error(
        `Unrecognized update issue response: ${response.response.status}`,
      )
    },

    async view({ issueKey, signal }) {
      const response = await client.GET('/api/issues/{key}', {
        params: { path: { key: issueKey } },
        signal,
      })
      if ('data' in response && response.data !== undefined) {
        return ok(mapIssue(response.data, client.baseUrl))
      }
      if ('data' in response) {
        return err({ type: 'temporarilyUnavailable' })
      }
      const failure = mapResourceFailure(response.response.status)
      if (failure) {
        return err(failure)
      }
      throw new Error(
        `Unrecognized view issue response: ${response.response.status}`,
      )
    },
  }
}
