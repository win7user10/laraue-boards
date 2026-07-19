import { assert, test } from 'vitest'

import { useOrganizationRoutes } from './useOrganizationRoutes'

test('adds the current organization to typed routes', () => {
  const originalComputed = Reflect.get(globalThis, 'computed')
  const originalUseRoute = Reflect.get(globalThis, 'useRoute')
  Reflect.set(globalThis, 'computed', (getValue: () => unknown) => ({
    get value() {
      return getValue()
    },
  }))
  Reflect.set(globalThis, 'useRoute', () => ({
    params: { organizationKey: 'acme-ab12' },
  }))

  try {
    const routes = useOrganizationRoutes()
    assert.deepEqual(routes.board('DEF', '5'), {
      name: 'organizations-organizationKey-spaces-spaceKey-boardId',
      params: {
        boardId: '5',
        organizationKey: 'acme-ab12',
        spaceKey: 'DEF',
      },
    })
    assert.deepEqual(routes.issue('BRD-120'), {
      name: 'organizations-organizationKey-issues-issueKey',
      params: {
        issueKey: 'BRD-120',
        organizationKey: 'acme-ab12',
      },
    })
  } finally {
    Reflect.set(globalThis, 'computed', originalComputed)
    Reflect.set(globalThis, 'useRoute', originalUseRoute)
  }
})
