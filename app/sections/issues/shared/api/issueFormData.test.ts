import { assert, test } from 'vitest'

import {
  createIssueFormData,
  updateIssueFormData,
} from '~/sections/issues/shared/api/issueFormData'

const input = {
  assigneeId: '00000000-0000-0000-0000-000000000001',
  attributeValues: [
    { $type: 'string' as const, attributeId: '1', value: 'value' },
  ],
  content: ' Issue ',
  files: [new File(['image'], 'image.png', { type: 'image/png' })],
  removeAttachmentIds: ['00000000-0000-0000-0000-000000000002'],
}

test('serializes issue files and fields as multipart form data', () => {
  const createForm = createIssueFormData({ ...input, statusId: '2' })
  assert.equal(createForm.get('Content'), 'Issue')
  assert.equal(createForm.get('StatusId'), '2')
  assert.equal((createForm.get('Files') as File).name, 'image.png')
  assert.deepEqual(JSON.parse(String(createForm.get('AttributeValues'))), [
    { $type: 'string', attributeId: '1', value: 'value' },
  ])

  const updateForm = updateIssueFormData(input)
  assert.equal((updateForm.get('AddFiles') as File).name, 'image.png')
  assert.deepEqual(updateForm.getAll('RemoveAttachmentIds'), [
    '00000000-0000-0000-0000-000000000002',
  ])
})
