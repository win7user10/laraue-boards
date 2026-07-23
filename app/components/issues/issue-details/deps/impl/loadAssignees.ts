import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import { tryRequest } from '#infrastructure/api/tryRequest'
import { failed, ok } from '~/utils/actionResult'

import type { LoadAssignees } from '../loadAssignees'

type SpaceMember = components['schemas']['SpaceMember']

const mapAssignees = (members: SpaceMember[]) =>
  members.map((member) => ({
    color: member.color,
    initials: member.initials,
    label: member.displayName,
    value: member.userId,
  }))

export const createLoadAssignees =
  (client: ApiClient): LoadAssignees =>
  async ({ spaceId }) => {
    const response = await tryRequest(() =>
      client.GET('/api/spaces/{id}/members', {
        params: { path: { id: Number(spaceId) } },
      }),
    )

    return response && 'data' in response && response.data !== undefined
      ? ok(mapAssignees(response.data))
      : failed()
  }
