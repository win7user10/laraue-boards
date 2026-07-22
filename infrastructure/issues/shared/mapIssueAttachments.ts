import type { components } from '#infrastructure/api/generated'
import type { IssueAttachmentViewModel } from '~/components/issues/IssueAttachments.vue'

type MediaInfo = components['schemas']['MediaInfo']

export const mapIssueAttachments = (
  media: MediaInfo[],
  baseUrl: string,
): IssueAttachmentViewModel[] =>
  media.flatMap((item) => {
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
        id: originalId,
        originalUrl: fileUrl(originalId),
        previewUrl: fileUrl(previewId),
      },
    ]
  })
