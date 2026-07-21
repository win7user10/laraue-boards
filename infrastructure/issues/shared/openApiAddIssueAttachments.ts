import { createApiClient } from '#infrastructure/api/client'

export const openApiAddIssueAttachments = (baseUrl: string) => {
  const client = createApiClient(baseUrl)
  return async (input: { files: File[]; issueKey: string }) => {
    try {
      const responses = await Promise.all(
        input.files.map((file) => {
          const formData = new FormData()
          formData.append('file', file)
          return client.POST('/api/issues/{key}/add-attachment', {
            body: {},
            bodySerializer: () => formData,
            params: { path: { key: input.issueKey } },
          })
        }),
      )
      return responses.every(({ response }) => response.status === 200)
        ? ok(null)
        : err('AttachmentUploadFailed' as const)
    } catch {
      return err('AttachmentUploadFailed' as const)
    }
  }
}
