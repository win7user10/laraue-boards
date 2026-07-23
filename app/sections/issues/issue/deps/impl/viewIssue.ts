import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import { tryRequest } from '#infrastructure/api/tryRequest'
import type { IssuePageData } from '~/sections/issues/issue/IssuePage.types'
import { err, ok } from '~/utils/actionResult'

import type { ViewIssue } from '../viewIssue'

type Schemas = components['schemas']

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
    const fileUrl = (id: string) => new URL(`/api/files/${encodeURIComponent(id)}`, baseUrl).href
    return [
      {
        id: attachment.id,
        originalUrl: fileUrl(originalId),
        previewUrl: fileUrl(previewId),
      },
    ]
  })

const mapIssue = (issue: Schemas['IssueDetailDto'], baseUrl: string): IssuePageData => ({
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

export const createViewIssue =
  (client: ApiClient): ViewIssue =>
  async ({ issueKey, signal }) => {
    const response = await tryRequest(() =>
      client.GET('/api/issues/{key}', {
        params: { path: { key: issueKey } },
        signal,
      }),
    )
    if (!response) {
      return err({ type: 'temporarilyUnavailable' })
    }
    if ('data' in response && response.data !== undefined) {
      return ok(mapIssue(response.data, client.baseUrl))
    }
    if ('data' in response) {
      return err({ type: 'temporarilyUnavailable' })
    }
    switch (response.response.status) {
      case 401:
      case 403:
        return err({ type: 'accessDenied' })
      case 404:
        return err({ type: 'issueNotFound' })
      default:
        return err({ type: 'temporarilyUnavailable' })
    }
  }
