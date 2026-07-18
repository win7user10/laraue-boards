<template>
  <BoardSettingsPage
    v-if="pageState.type === 'ready'"
    :error="error"
    :space-key="spaceKey"
    :submitting="submitting"
    :view-model="pageState.data.BoardSettingsPage"
    @delete="remove"
    @update="update" />
  <PageLoadState
    v-else
    :error-text="pageState.type === 'error' ? pageState.message : ''"
    :loading="pageState.type === 'pending'"
    loading-text="Loading board…"
    @retry="refresh()" />
</template>
<script setup lang="ts">
import type { BoardSettingsPageApplicationDeps } from './BoardSettingsPageApplicationDeps'
import BoardSettingsPage from './view/BoardSettingsPage.vue'
const props = defineProps<{
  boardId: string
  deps: BoardSettingsPageApplicationDeps
  spaceKey: string
}>()
const organizationRoutes = useOrganizationRoutes()
const { refresh, state: pageState } = await useActionData({
  action: () => props.deps.viewBoardSettingsPage({ boardId: props.boardId }),
  fallbackMessage: 'Could not load board. Try again.',
  key: () => asyncDataKeys.board.settings(props.boardId),
  messages: {
    AccessDenied: 'You do not have access to this board.',
    BoardNotFound: 'The board was not found or is not available to you.',
    TemporarilyUnavailable:
      'Could not load board. The service is temporarily unavailable.',
  },
  watch: [() => props.boardId],
})
useHead({
  title: computed(() =>
    pageState.value.type === 'ready'
      ? `${pageState.value.data.BoardSettingsPage.name} settings`
      : 'Board settings',
  ),
})
const submitting = ref(false)
const error = ref<null | string>(null)
const invalidation = useAsyncDataInvalidation()
type BoardColumn = { color: string; id: string; name: string }
type BoardColumnDraft = { color: string; id: null | string; name: string }
function getBoardColumnChanges(
  originalColumns: BoardColumn[],
  columns: BoardColumnDraft[],
) {
  const currentIds = new Set(
    columns.flatMap((column) => (column.id === null ? [] : [column.id])),
  )
  return {
    created: columns.filter((column) => column.id === null),
    deleted: originalColumns.filter((column) => !currentIds.has(column.id)),
    updated: columns.filter((column): column is BoardColumn => {
      if (column.id === null) {
        return false
      }
      const original = originalColumns.find((item) => item.id === column.id)
      return original?.name !== column.name || original.color !== column.color
    }),
  }
}
async function update(input: {
  color: string
  columns: Array<{ color: string; id: null | string; name: string }>
  name: string
}) {
  submitting.value = true
  error.value = null
  const result = await props.deps.updateBoard({
    boardId: props.boardId,
    ...input,
  })
  await matchActionResult({
    err: async (actionError) => {
      error.value = getErrorMessage({
        error: actionError,
        messages: {
          AccessDenied: 'You do not have permission to update this board.',
          BoardNotFound: 'The board was not found.',
          TemporarilyUnavailable: 'Could not save board. Try again.',
        },
      })
    },
    ok: async () => {
      const originalColumns =
        pageState.value.type === 'ready'
          ? pageState.value.data.BoardSettingsPage.columns
          : []
      const changes = getBoardColumnChanges(originalColumns, input.columns)
      const createdColumnResults = await Promise.all(
        changes.created.map((column) =>
          props.deps.createBoardColumn({
            boardId: props.boardId,
            color: column.color,
            name: column.name.trim(),
          }),
        ),
      )
      const updatedColumnResults = await Promise.all(
        changes.updated.map((column) =>
          props.deps.updateBoardColumn({
            boardColumnId: column.id,
            color: column.color,
            name: column.name.trim(),
          }),
        ),
      )
      const createdColumnIds: string[] = []
      let columnError: null | string = null
      for (const columnResult of createdColumnResults) {
        matchActionResult({
          err: (actionError) => {
            columnError ??= getErrorMessage({
              error: actionError,
              messages: {
                AccessDenied:
                  'You do not have permission to update this board.',
                BoardNotFound: 'The board was not found.',
                TemporarilyUnavailable: 'Could not save board. Try again.',
              },
            })
          },
          ok: ({ boardColumnId }) => createdColumnIds.push(boardColumnId),
          result: columnResult,
        })
      }
      for (const columnResult of updatedColumnResults) {
        matchActionResult({
          err: (actionError) => {
            columnError ??= getErrorMessage({
              error: actionError,
              messages: {
                AccessDenied:
                  'You do not have permission to update this board.',
                BoardColumnNotFound: 'The board column was not found.',
                TemporarilyUnavailable: 'Could not save board. Try again.',
              },
            })
          },
          ok: () => {},
          result: columnResult,
        })
      }
      if (columnError === null) {
        const deletedColumnResults = await Promise.all(
          changes.deleted.map((column) =>
            props.deps.deleteBoardColumn({ boardColumnId: column.id }),
          ),
        )
        for (const columnResult of deletedColumnResults) {
          matchActionResult({
            err: (actionError) => {
              columnError ??= getErrorMessage({
                error: actionError,
                messages: {
                  AccessDenied:
                    'You do not have permission to update this board.',
                  BoardColumnNotFound: 'The board column was not found.',
                  TemporarilyUnavailable: 'Could not save board. Try again.',
                },
              })
            },
            ok: () => {},
            result: columnResult,
          })
        }
      }
      invalidation.invalidateBoardStructure(
        asyncDataKeys.board.settings(props.boardId),
      )
      if (columnError !== null) {
        await refresh()
        error.value = columnError
        return
      }
      let createdColumnIndex = 0
      const boardColumnIds = input.columns.flatMap((column) => {
        if (column.id !== null) {
          return [column.id]
        }
        const boardColumnId = createdColumnIds[createdColumnIndex]
        createdColumnIndex += 1
        return boardColumnId === undefined ? [] : [boardColumnId]
      })
      if (boardColumnIds.length > 0) {
        const reorderResult = await props.deps.reorderBoardColumns({
          boardColumnIds,
          boardId: props.boardId,
        })
        let reorderFailed = false
        matchActionResult({
          err: (actionError) => {
            reorderFailed = true
            error.value = getErrorMessage({
              error: actionError,
              messages: {
                AccessDenied:
                  'You do not have permission to reorder these columns.',
                BoardNotFound: 'The board was not found.',
                TemporarilyUnavailable:
                  'Could not save column order. Try again.',
              },
            })
          },
          ok: () => {},
          result: reorderResult,
        })
        if (reorderFailed) {
          await refresh()
          return
        }
      }
      await navigateTo(organizationRoutes.board(props.spaceKey, props.boardId))
    },
    result,
  })
  submitting.value = false
}
async function remove() {
  if (!confirm('Delete this board?')) {
    return
  }
  submitting.value = true
  const result = await props.deps.deleteBoard({ boardId: props.boardId })
  submitting.value = false
  await matchActionResult({
    err: async (actionError) => {
      error.value = getErrorMessage({
        error: actionError,
        messages: {
          AccessDenied: 'You do not have permission to delete this board.',
          BoardNotFound: 'This board no longer exists.',
          TemporarilyUnavailable: 'Could not delete board. Try again.',
        },
      })
    },
    ok: async () => {
      invalidation.invalidateBoardStructure()
      await navigateTo(organizationRoutes.space(props.spaceKey))
    },
    result,
  })
}
</script>
