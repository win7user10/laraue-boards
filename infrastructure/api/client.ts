import createFetchClient from 'openapi-fetch'

import type { paths } from '#infrastructure/api/generated'

export type CreateApiClientOptions = {
  baseUrl: string
  fetch?: typeof globalThis.fetch
  headers?: HeadersInit
}

export const createApiClient = (options: CreateApiClientOptions | string) => {
  const baseUrl = typeof options === 'string' ? options : options.baseUrl
  const fetch =
    typeof options === 'string'
      ? globalThis.fetch
      : (options.fetch ?? globalThis.fetch)
  const headers =
    typeof options === 'string'
      ? import.meta.server
        ? useRequestHeaders(['cookie'])
        : undefined
      : options.headers

  return createFetchClient<paths>({
    baseUrl,
    credentials: 'include',
    fetch,
    headers,
  })
}

export type ApiClient = ReturnType<typeof createApiClient>
