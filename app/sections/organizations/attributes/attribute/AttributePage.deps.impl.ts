import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import { getInvalidInputError } from '#infrastructure/api/getInvalidInputError'
import type {
  Attribute,
  AttributePageDeps,
  ChangeAttributeFailure,
  ViewAttributeFailure,
} from '~/sections/organizations/attributes/attribute/AttributePage.deps'
import { err, ok } from '~/utils/actionResult'

const mapAttribute = (value: components['schemas']['AttributeDto']): Attribute => {
  if (value.id === undefined) {
    throw new TypeError('Attribute id is required')
  }
  if (value.type === 0) {
    return {
      color: value.color,
      data: { type: 'text' },
      id: String(value.id),
      name: value.name,
    }
  }
  if (value.type !== 1) {
    throw new RangeError(`Unsupported attribute type: ${value.type}`)
  }
  return {
    color: value.color,
    data: {
      listValues: value.listValues.map((option) => {
        if (option.id === undefined) {
          throw new TypeError('Attribute option id is required')
        }
        return { id: String(option.id), name: option.name }
      }),
      type: 'list',
    },
    id: String(value.id),
    name: value.name,
  }
}
const mapViewFailure = (status: number): undefined | ViewAttributeFailure => {
  if (status === 401 || status === 403) {
    return { type: 'accessDenied' }
  }
  if (status === 404) {
    return { type: 'attributeNotFound' }
  }
  if (status >= 500) {
    return { type: 'temporarilyUnavailable' }
  }
}
const mapChangeFailure = (status: number, error: unknown): ChangeAttributeFailure | undefined =>
  status === 400
    ? { message: getInvalidInputError(error).message, type: 'invalidInput' }
    : mapViewFailure(status)

export function createAttributePageDeps(client: ApiClient): AttributePageDeps {
  return {
    async delete({ id }) {
      const response = await client.DELETE('/api/organizations/attributes/{id}', {
        params: { path: { id: Number(id) } },
      })
      if ('data' in response) {
        return ok(undefined)
      }
      const failure = mapViewFailure(response.response.status)
      if (failure) {
        return err(failure)
      }
      throw new Error(`Unrecognized delete attribute response: ${response.response.status}`)
    },
    async update(input) {
      const response = await client.PUT('/api/organizations/attributes/{id}', {
        body: {
          color: input.color,
          id: Number(input.id),
          listValues:
            input.data.type === 'list'
              ? input.data.listValues.map((option) => ({
                  id: option.id,
                  name: option.name.trim(),
                }))
              : null,
          name: input.name.trim(),
        },
        params: { path: { id: Number(input.id) } },
      })
      if ('data' in response) {
        return ok(undefined)
      }
      const failure = mapChangeFailure(response.response.status, response.error)
      if (failure) {
        return err(failure)
      }
      throw new Error(`Unrecognized update attribute response: ${response.response.status}`)
    },
    async view({ attributeId, signal }) {
      const response = await client.GET('/api/organizations/attributes', {
        signal,
      })
      if ('error' in response) {
        const failure = mapViewFailure(response.response.status)
        if (failure) {
          return err(failure)
        }
        throw new Error(`Unrecognized attribute response: ${response.response.status}`)
      }
      const attribute = response.data.find((item) => String(item.id) === attributeId)
      return attribute ? ok(mapAttribute(attribute)) : err({ type: 'attributeNotFound' })
    },
  }
}
