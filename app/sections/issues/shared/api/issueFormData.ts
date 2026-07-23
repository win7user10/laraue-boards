import type { components } from '#infrastructure/api/generated'

type AttributeValue = components['schemas']['AttributeValue']

const appendIssueFields = (
  formData: FormData,
  input: {
    assigneeId: string
    attributeValues: AttributeValue[]
    content: string
  },
) => {
  formData.append('AssigneeId', input.assigneeId)
  formData.append('AttributeValues', JSON.stringify(input.attributeValues))
  formData.append('Content', input.content.trim())
}

export const createIssueFormData = (input: {
  assigneeId: string
  attributeValues: AttributeValue[]
  content: string
  files: File[]
  statusId: string
}) => {
  const formData = new FormData()
  appendIssueFields(formData, input)
  formData.append('StatusId', input.statusId)
  input.files.forEach((file) => formData.append('Files', file))
  return formData
}

export const updateIssueFormData = (input: {
  assigneeId: string
  attributeValues: AttributeValue[]
  content: string
  files: File[]
  removeAttachmentIds: string[]
}) => {
  const formData = new FormData()
  appendIssueFields(formData, input)
  input.files.forEach((file) => formData.append('AddFiles', file))
  input.removeAttachmentIds.forEach((id) => formData.append('RemoveAttachmentIds', id))
  return formData
}
