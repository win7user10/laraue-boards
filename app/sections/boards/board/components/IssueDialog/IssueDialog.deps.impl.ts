import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import { tryRequest } from '#infrastructure/api/tryRequest'
import { createIssueDetailsDeps } from '~/components/issue-details/deps/impl'
import type {
  IssueDialogDeps,
  IssueDialogViewModel,
} from '~/sections/boards/board/components/IssueDialog/IssueDialog.deps'
import { err, failed, ok } from '~/utils/actionResult'

type Schemas = components['schemas']

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

export const createIssueDialogDeps = (client: ApiClient): IssueDialogDeps => ({
  deleteIssue: async ({ issueKey }) => {
    const response = await tryRequest(() =>
      client.DELETE('/api/issues/{key}', {
        params: { path: { key: issueKey } },
      }),
    )

    return response && 'data' in response ? ok(undefined) : failed()
  },
  issueDetails: createIssueDetailsDeps(client),
  loadIssue: async ({ issueKey }) => {
    const response = await tryRequest(() =>
      client.GET('/api/issues/{key}', {
        params: { path: { key: issueKey } },
      }),
    )

    if (!response) {
      return err({ type: 'temporarilyUnavailable' })
    }
    if ('data' in response) {
      return response.data
        ? ok({ IssueDialog: mapIssueDialog(response.data, client.baseUrl) })
        : err({ type: 'temporarilyUnavailable' })
    }
    if (response.response.status === 401 || response.response.status === 403) {
      return err({ type: 'accessDenied' })
    }
    return err(
      response.response.status === 404
        ? { type: 'issueNotFound' }
        : { type: 'temporarilyUnavailable' },
    )
  },
})
