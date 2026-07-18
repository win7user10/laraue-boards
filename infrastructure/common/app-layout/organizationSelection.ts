export const getOrganizationKey = (organization: {
  slug: string
  slugPostfix: string
}) => `${organization.slug}-${organization.slugPostfix}`

export const findOrganizationByKey = <
  Organization extends { slug: string; slugPostfix: string },
>(
  organizations: Organization[],
  organizationKey: string,
) =>
  organizations.find(
    (organization) => getOrganizationKey(organization) === organizationKey,
  )

export const shouldSelectOrganization = (
  currentOrganizationId: number | string | undefined,
  organizationId: string,
) => String(currentOrganizationId ?? '') !== organizationId
