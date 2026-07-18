import type { Logout } from '../../../app/sections/common/app-layout/actions/logout'
import { createApiClient } from '../../api/client'
import { clearAuthTokens } from '../../auth/tokenStorage'

export const openApiLogout =
  (baseUrl: string): Logout =>
  async () => {
    const client = createApiClient(baseUrl)
    try {
      await client.POST('/api/user/logout')
    } catch {
      // Local logout must continue even if the server is unavailable.
    } finally {
      clearAuthTokens()
    }
  }
