export type AddIssueAttachments = (input: {
  files: File[]
  issueKey: string
}) => Promise<ActionResult<null, 'AttachmentUploadFailed'>>
