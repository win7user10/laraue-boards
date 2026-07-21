import type { components } from '#infrastructure/api/generated'

type OrganizationMember = components['schemas']['OrganizationMember']

export const mapOrganizationMembers = (members: OrganizationMember[]) =>
  members.flatMap((member) => {
    if (member.organizationUserId === undefined) {
      return []
    }
    return [
      {
        color: member.color,
        id: String(member.organizationUserId),
        initials: member.initials,
        isAdmin: member.adminAccessLevel !== 0,
        isOwner: member.isOwner,
        name: member.displayName,
      },
    ]
  })
