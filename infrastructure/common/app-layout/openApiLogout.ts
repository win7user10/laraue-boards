import type { Logout } from '../../../app/sections/common/app-layout/actions/logout'
import { createApiClient } from '../../api/client'

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
