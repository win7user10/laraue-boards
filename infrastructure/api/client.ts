import createFetchClient from 'openapi-fetch'

import { getOrganizationToken, getUserToken } from '../auth/tokenStorage'
import type { paths } from './generated'

export const createApiClient = (
  baseUrl: string,
  token: null | string = getOrganizationToken() ?? getUserToken(),
) => {
  return createFetchClient<paths>({
    baseUrl,
    credentials: 'include',
    fetch: globalThis.fetch,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // SSR fetch has no browser cookie jar; forward the incoming request's
      // cookie so the backend sees the session on full page loads/reloads.
      ...(import.meta.server ? useRequestHeaders(['cookie']) : {}),
    },
  })
}
