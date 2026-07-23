import type { components } from '#infrastructure/api/generated'
import type { IssueAttachmentViewModel } from '~/components/issues/IssueAttachments.vue'

type AttachmentData = components['schemas']['AttachmentData']

export const mapIssueAttachments = (
  attachments: AttachmentData[],
  baseUrl: string,
): IssueAttachmentViewModel[] =>
  attachments.flatMap((item) => {
    if (item.type !== 0) {
      return []
    }
    const previewId = item.previewFileId ?? item.originalFileId
    if (!previewId) {
      return []
    }
    const originalId = item.originalFileId ?? previewId
    const fileUrl = (id: string) =>
      new URL(`/api/files/${encodeURIComponent(id)}`, baseUrl).href
    return [
      {
        id: item.id,
        originalUrl: fileUrl(originalId),
        previewUrl: fileUrl(previewId),
      },
    ]
  })
