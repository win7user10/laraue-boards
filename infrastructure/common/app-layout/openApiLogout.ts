import { createApiClient } from '#infrastructure/api/client'
import type { Logout } from '~/sections/common/app-layout/deps/logout'

export const openApiLogout =
  (baseUrl: string): Logout =>
  async () => {
    const client = createApiClient(baseUrl)
    try {
      await client.POST('/api/user/logout')
    } catch {
      // Navigation can continue even if the server is unavailable.
    }
  }
