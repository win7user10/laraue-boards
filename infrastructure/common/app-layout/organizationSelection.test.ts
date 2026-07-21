import { assert, test } from 'vitest'

import {
  findOrganizationByKey,
  getOrganizationKey,
  shouldSelectOrganization,
} from '#infrastructure/common/app-layout/organizationSelection'

test('selects the organization requested by the URL', () => {
  assert.equal(shouldSelectOrganization(1, '2'), true)
  assert.equal(shouldSelectOrganization(2, '2'), false)
  const organization = { id: 1, slug: 'acme-tools', slugPostfix: 'ab12' }
  assert.equal(getOrganizationKey(organization), 'acme-tools-ab12')
  assert.deepEqual(
    findOrganizationByKey([organization], 'acme-tools-ab12'),
    organization,
  )
  assert.equal(findOrganizationByKey([organization], 'other-ab12'), undefined)
})
