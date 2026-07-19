import type { components } from '../../api/generated'

type SpaceMember = components['schemas']['SpaceMember']

export const mapOrganizationAssignees = (members: SpaceMember[]) =>
  members.map((member) => ({
    color: member.color,
    initials: member.initials,
    label: member.displayName,
    value: member.userId,
  }))
