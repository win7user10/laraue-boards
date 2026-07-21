import { afterEach, assert, test, vi } from 'vitest'

import { openApiAddIssueAttachments } from '#infrastructure/issues/shared/openApiAddIssueAttachments'
import { err, ok } from '~/utils/actionResult'

afterEach(() => vi.unstubAllGlobals())

test('uploads each attachment as a file form field', async () => {
  const requests: Request[] = []
  vi.stubGlobal('err', err)
  vi.stubGlobal('ok', ok)
  vi.stubGlobal('fetch', async (input: Request | string | URL) => {
    const request = input instanceof Request ? input : new Request(input)
    requests.push(request.clone())
    return Response.json({ type: 0 }, { status: 200 })
  })

  const files = [
    new File(['png'], 'first.png', { type: 'image/png' }),
    new File(['jpg'], 'second.jpg', { type: 'image/jpeg' }),
  ]
  const addAttachments = openApiAddIssueAttachments('https://api.example')

  assert.deepEqual(await addAttachments({ files, issueKey: 'DEV-1' }), ok(null))
  assert.equal(requests.length, 2)
  for (const [index, request] of requests.entries()) {
    assert.equal(
      request.url,
      'https://api.example/api/issues/DEV-1/add-attachment',
    )
    assert.equal(request.credentials, 'include')
    assert.match(
      request.headers.get('content-type') ?? '',
      /^multipart\/form-data; boundary=/,
    )
    const uploadedFile = (await request.formData()).get('file')
    assert.equal((uploadedFile as File).name, files[index]?.name)
  }

  vi.stubGlobal('fetch', async () => Response.json({}, { status: 500 }))
  assert.deepEqual(
    await addAttachments({ files: files.slice(0, 1), issueKey: 'DEV-1' }),
    err('AttachmentUploadFailed'),
  )
})
