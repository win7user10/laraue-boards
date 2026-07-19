import createFetchClient from 'openapi-fetch'

import type { paths } from './generated'

export const createApiClient = (baseUrl: string) =>
  createFetchClient<paths>({
    baseUrl,
    credentials: 'include',
    fetch: globalThis.fetch,
    headers: {
      // SSR fetch has no browser cookie jar; forward the incoming request's
      // cookie so the backend sees the session on full page loads/reloads.
      ...(import.meta.server ? useRequestHeaders(['cookie']) : {}),
    },
  })
