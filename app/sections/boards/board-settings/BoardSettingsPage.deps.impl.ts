import type { ApiClient } from '#infrastructure/api/client'
import { getInvalidInputError } from '#infrastructure/api/getInvalidInputError'
import { DEFAULT_COLOR } from '~/constants/colors'
import type {
  BoardSettingsColumn,
  BoardSettingsColumnDraft,
  BoardSettingsPageDeps,
  ChangeBoardFailure,
  SaveBoardFailure,
  ViewBoardSettingsFailure,
} from '~/sections/boards/board-settings/BoardSettingsPage.deps'
import { err, ok } from '~/utils/actionResult'

const mapViewFailure = (
  status: number,
): undefined | ViewBoardSettingsFailure => {
  if (status === 401 || status === 403) {
    return { type: 'accessDenied' }
  }
  if (status === 404) {
    return { type: 'boardNotFound' }
  }
  if (status >= 500) {
    return { type: 'temporarilyUnavailable' }
  }
}

const mapChangeFailure = (status: number): ChangeBoardFailure | undefined =>
  mapViewFailure(status)

const mapSaveFailure = (
  status: number,
  error: unknown,
  column: boolean,
): SaveBoardFailure | undefined => {
  if (status === 400) {
    return {
      message: getInvalidInputError(error).message,
      type: 'invalidInput',
    }
  }
  if (status === 401 || status === 403) {
    return { type: 'accessDenied' }
  }
  if (status === 404) {
    return { type: column ? 'boardColumnNotFound' : 'boardNotFound' }
  }
  if (status >= 500) {
    return { type: 'temporarilyUnavailable' }
  }
}

const getColumnChanges = (
  originalColumns: BoardSettingsColumn[],
  columns: BoardSettingsColumnDraft[],
) => {
  const currentIds = new Set(
    columns.flatMap((column) => (column.id === null ? [] : [column.id])),
  )
  return {
    created: columns.filter((column) => column.id === null),
    deleted: originalColumns.filter((column) => !currentIds.has(column.id)),
    updated: columns.filter((column): column is BoardSettingsColumn => {
      if (column.id === null) {
        return false
      }
      const original = originalColumns.find((item) => item.id === column.id)
      return original?.name !== column.name || original.color !== column.color
    }),
  }
}

const getColumnSortOrders = (columnIds: string[]) =>
  Object.fromEntries(columnIds.map((id, index) => [id, index + 1]))

export function createBoardSettingsPageDeps(
  client: ApiClient,
): BoardSettingsPageDeps {
  const saveRequest = async (
    request: Promise<Awaited<ReturnType<typeof client.PUT>>>,
    column = false,
  ) => {
    const response = await request
    if ('data' in response) {
      return null
    }
    const failure = mapSaveFailure(
      response.response.status,
      response.error,
      column,
    )
    if (failure) {
      return failure
    }
    throw new Error(
      `Unrecognized save board response: ${response.response.status}`,
    )
  }

  return {
    async remove({ boardId }) {
      const response = await client.DELETE('/api/epics/{id}', {
        params: { path: { id: Number(boardId) } },
      })
      if ('data' in response) {
        return ok(null)
      }
      const failure = mapChangeFailure(response.response.status)
      if (failure) {
        return err(failure)
      }
      throw new Error(
        `Unrecognized delete board response: ${response.response.status}`,
      )
    },

    async save(input) {
      const boardFailure = await saveRequest(
        client.PUT('/api/epics/{id}', {
          body: { color: input.color, id: input.boardId, name: input.name },
          params: { path: { id: Number(input.boardId) } },
        }),
      )
      if (boardFailure) {
        return err(boardFailure)
      }

      const changes = getColumnChanges(input.originalColumns, input.columns)
      const createdIds: string[] = []
      for (const column of changes.created) {
        const response = await client.POST('/api/statuses', {
          body: {
            color: column.color,
            epicId: input.boardId,
            name: column.name,
          },
        })
        if ('data' in response && response.data !== undefined) {
          createdIds.push(String(response.data))
          continue
        }
        const failure = mapSaveFailure(
          response.response.status,
          'error' in response ? response.error : undefined,
          false,
        )
        if (failure) {
          return err(failure)
        }
        throw new Error(
          `Unrecognized create board column response: ${response.response.status}`,
        )
      }

      for (const column of changes.updated) {
        const failure = await saveRequest(
          client.PUT('/api/statuses/{id}', {
            body: { color: column.color, id: column.id, name: column.name },
            params: { path: { id: Number(column.id) } },
          }),
          true,
        )
        if (failure) {
          return err(failure)
        }
      }

      for (const column of changes.deleted) {
        const response = await client.DELETE('/api/statuses/{id}', {
          params: { path: { id: Number(column.id) } },
        })
        if ('data' in response) {
          continue
        }
        const failure = mapSaveFailure(
          response.response.status,
          response.error,
          true,
        )
        if (failure) {
          return err(failure)
        }
        throw new Error(
          `Unrecognized delete board column response: ${response.response.status}`,
        )
      }

      let createdIndex = 0
      const columnIds = input.columns.flatMap((column) => {
        if (column.id !== null) {
          return [column.id]
        }
        const id = createdIds[createdIndex]
        createdIndex += 1
        return id === undefined ? [] : [id]
      })
      if (columnIds.length > 0) {
        const response = await client.POST('/api/epics/{id}/reorder-statuses', {
          body: getColumnSortOrders(columnIds),
          params: { path: { id: Number(input.boardId) } },
        })
        if ('data' in response) {
          return ok(null)
        }
        const failure = mapSaveFailure(
          response.response.status,
          response.error,
          false,
        )
        if (failure) {
          return err(failure)
        }
        throw new Error(
          `Unrecognized reorder board columns response: ${response.response.status}`,
        )
      }
      return ok(null)
    },

    async view({ boardId, signal }) {
      const response = await client.GET('/api/epics/{id}', {
        params: { path: { id: Number(boardId) } },
        signal,
      })
      if ('data' in response && response.data) {
        return ok({
          canDelete: response.data.canDelete ?? false,
          canUpdate: response.data.canUpdate ?? false,
          color: response.data.color ?? DEFAULT_COLOR,
          columns: (response.data.statuses ?? [])
            .toSorted(
              (left, right) => Number(left.sortOrder) - Number(right.sortOrder),
            )
            .map((status) => ({
              color: status.color ?? DEFAULT_COLOR,
              id: String(status.id),
              name: status.name,
            })),
          name: response.data.name,
        })
      }
      const failure = mapViewFailure(response.response.status)
      if (failure) {
        return err(failure)
      }
      throw new Error(
        `Unrecognized board settings response: ${response.response.status}`,
      )
    },
  }
}
