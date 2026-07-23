export const getOrganizationKey = (organization: {
  slug: string
  slugPostfix: string
}) => `${organization.slug}-${organization.slugPostfix}`
