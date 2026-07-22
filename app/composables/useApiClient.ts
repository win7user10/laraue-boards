import { createApiClient } from '#infrastructure/api/client'

export const useApiClient = () => {
  const config = useRuntimeConfig()

  return createApiClient({
    baseUrl: config.public.boardsApiBaseUrl,
    headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
  })
}
