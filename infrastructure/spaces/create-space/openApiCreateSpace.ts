import type { CreateSpace } from '../../../app/sections/spaces/create-space/actions/createSpace'
import { createApiClient } from '../../api/client'
import { getInvalidInputError } from '../../api/getInvalidInputError'

export const openApiCreateSpace =
  (baseUrl: string): CreateSpace =>
  async (input) => {
    const client = createApiClient(baseUrl)
    try {
      const response = await client.POST('/api/spaces', { body: input })
      switch (response.response.status) {
        case 400:
          return err(getInvalidInputError(response.error))
        case 401:
        case 403:
          return err('AccessDenied')
        case 404:
          return err('OrganizationNotFound')
        default:
          break
      }
      if (response.data === undefined) {
        return err('TemporarilyUnavailable')
      }
      return ok({ spaceKey: input.key })
    } catch {
      return err('TemporarilyUnavailable')
    }
  }
