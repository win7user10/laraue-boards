import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import { getInvalidInputError } from '#infrastructure/api/getInvalidInputError'
import type {
  IssueDialogDeps,
  IssueDialogViewModel,
} from '~/sections/boards/board/components/IssueDialog/IssueDialog.deps'
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
    const fileUrl = (id: string) => new URL(`/api/files/${encodeURIComponent(id)}`, baseUrl).href
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

export function createIssueDialogDeps(client: ApiClient): IssueDialogDeps {
  const moveIssue: IssueDialogDeps['moveIssue'] = async ({ issueKey, statusId }) => {
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
  }

  return {
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
          return err({ type: 'accessDenied' })
        case 404:
          return err({ type: 'issueNotFound' })
        default:
          return err({ type: 'temporarilyUnavailable' })
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
              ? ok({ assignees: mapOrganizationAssignees(response.data) })
              : err({ type: 'temporarilyUnavailable' })
          case 401:
          case 403:
            return err({ type: 'accessDenied' })
          case 404:
            return err({ type: 'spaceNotFound' })
          default:
            return err({ type: 'temporarilyUnavailable' })
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
              : err({ type: 'temporarilyUnavailable' })
          case 401:
          case 403:
            return err({ type: 'accessDenied' })
          case 404:
            return err({ type: 'spaceNotFound' })
          default:
            return err({ type: 'temporarilyUnavailable' })
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
              : err({ type: 'temporarilyUnavailable' })
          case 401:
          case 403:
            return err({ type: 'accessDenied' })
          default:
            return err({ type: 'temporarilyUnavailable' })
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
                    .toSorted((a, b) => Number(a.sortOrder) - Number(b.sortOrder))
                    .map((status) => ({
                      id: String(status.id),
                      name: status.name,
                    })),
                })
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
            : err({ type: 'temporarilyUnavailable' })
        case 401:
        case 403:
          return err({ type: 'accessDenied' })
        case 404:
          return err({ type: 'issueNotFound' })
        default:
          return err({ type: 'temporarilyUnavailable' })
      }
    },
    moveIssue,
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
          return err({
            message: getInvalidInputError(response.error).message,
            type: 'invalidInput',
          })
        case 401:
        case 403:
          return err({ type: 'accessDenied' })
        case 404:
          return err({ type: 'issueNotFound' })
        default:
          return err({ type: 'temporarilyUnavailable' })
      }
    },
  }
}
