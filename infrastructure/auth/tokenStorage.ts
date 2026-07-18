const userTokenKey = 'bearer'
const organizationTokenKey = 'organization_bearer'

const storage = () =>
  typeof localStorage === 'undefined' ? null : globalThis.localStorage

export const getUserToken = () => storage()?.getItem(userTokenKey) ?? null
export const getOrganizationToken = () =>
  storage()?.getItem(organizationTokenKey) ?? null
export const setUserToken = (token: string) => {
  storage()?.removeItem(organizationTokenKey)
  storage()?.setItem(userTokenKey, token)
}
export const setOrganizationToken = (token: string) =>
  storage()?.setItem(organizationTokenKey, token)
export const clearAuthTokens = () => {
  storage()?.removeItem(organizationTokenKey)
  storage()?.removeItem(userTokenKey)
}
