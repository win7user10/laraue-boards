<template>
  <PageState
    error-title="Could not load board"
    loading-text="Loading board…"
    :on-retry="query.refresh"
    :state="pageState">
    <template #default="{ data }">
      <section class="form-page">
        <div class="title-row">
          <div class="page-heading">
            <AppBackLink
              label="Back to board"
              :to="organizationRoutes.board(spaceKey, boardId)" />
            <BoardIcon
              class="page-heading-icon"
              :style="{ color: data.color }" />
            <div class="page-heading-text"><h1>Edit board</h1></div>
          </div>
        </div>
        <BoardSettingsForm
          :error="state.error"
          :on-delete="remove"
          :on-update="(input) => save(data, input)"
          :submitting="state.submitting"
          :view-model="data" />
      </section>
    </template>
  </PageState>
</template>

<script setup lang="ts">
import { BoardIcon } from '~/constants/icons'
import type {
  BoardSettingsColumnDraft,
  BoardSettingsPageData,
  BoardSettingsPageDeps,
  ChangeBoardFailure,
  SaveBoardFailure,
  ViewBoardSettingsFailure,
} from '~/sections/boards/board-settings/BoardSettingsPage.deps'
import BoardSettingsForm from '~/sections/boards/board-settings/components/BoardSettingsForm.vue'
import { matchResult } from '~/utils/actionResult'
import { assertNever } from '~/utils/assertNever'
import { toAsyncResultState } from '~/utils/asyncResultState'

const props = defineProps<{
  boardId: string
  deps: BoardSettingsPageDeps
  onDeleted: () => Promise<void> | void
  onSaved: () => Promise<void> | void
  spaceKey: string
}>()
const organizationRoutes = useOrganizationRoutes()
const state = reactive({
  error: null as null | string,
  submitting: false,
})

const query = await useAsyncData(
  () => `board-settings:${props.boardId}`,
  (_nuxtApp, { signal }) => props.deps.view({ boardId: props.boardId, signal }),
  { watch: [() => props.boardId] },
)
const getViewFailureMessage = (failure: ViewBoardSettingsFailure): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'You do not have access to this board.'
    case 'boardNotFound':
      return 'The board was not found or is not available to you.'
    case 'temporarilyUnavailable':
      return 'Could not load board. The service is temporarily unavailable.'
    default:
      return assertNever(failure)
  }
}
const pageState = computed(() =>
  toAsyncResultState({
    error: query.error.value,
    getErrorMessage: getViewFailureMessage,
    result: query.data.value,
    status: query.status.value,
  }),
)
const page = computed(() =>
  pageState.value.type === 'ready' ? pageState.value.data : null,
)

useHead({
  title: computed(() =>
    page.value ? `${page.value.name} settings` : 'Board settings',
  ),
})

const getChangeFailureMessage = (
  failure: ChangeBoardFailure,
  operation: 'delete' | 'save',
): string => {
  switch (failure.type) {
    case 'accessDenied':
      return `You do not have permission to ${operation} this board.`
    case 'boardNotFound':
      return operation === 'delete'
        ? 'This board no longer exists.'
        : 'The board was not found.'
    case 'temporarilyUnavailable':
      return `Could not ${operation} board. Try again.`
    default:
      return assertNever(failure)
  }
}

const getSaveFailureMessage = (failure: SaveBoardFailure): string => {
  switch (failure.type) {
    case 'invalidInput':
      return failure.message
    case 'boardColumnNotFound':
      return 'A board column was not found.'
    case 'accessDenied':
    case 'boardNotFound':
    case 'temporarilyUnavailable':
      return getChangeFailureMessage(failure, 'save')
    default:
      return assertNever(failure)
  }
}

async function save(
  current: BoardSettingsPageData,
  input: { color: string; columns: BoardSettingsColumnDraft[]; name: string },
): Promise<void> {
  if (state.submitting) {
    return
  }
  state.error = null
  state.submitting = true
  try {
    const result = await props.deps.save({
      boardId: props.boardId,
      originalColumns: current.columns,
      ...input,
    })
    await matchResult(result, {
      err: async (failure) => {
        await query.refresh()
        state.error = getSaveFailureMessage(failure)
      },
      ok: props.onSaved,
    })
  } finally {
    state.submitting = false
  }
}

async function remove(): Promise<void> {
  if (state.submitting || !confirm('Delete this board?')) {
    return
  }
  state.error = null
  state.submitting = true
  try {
    const result = await props.deps.remove({ boardId: props.boardId })
    await matchResult(result, {
      err: (failure) => {
        state.error = getChangeFailureMessage(failure, 'delete')
      },
      ok: props.onDeleted,
    })
  } finally {
    state.submitting = false
  }
}
</script>
