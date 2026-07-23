<template>
  <section class="form-page">
    <div class="page-heading">
      <AppBackLink
        label="Back to space"
        :to="organizationRoutes.space(spaceKey)" />
      <div class="page-heading-text">
        <h1>Create board</h1>
      </div>
    </div>
    <form @submit.prevent="submit">
      <label>Name</label>
      <input
        v-model="state.name"
        required />
      <label>Color</label>
      <AppColorPicker v-model="state.color" />
      <p
        v-if="state.error"
        class="form-error">
        {{ state.error }}
      </p>
      <div class="form-actions">
        <button
          class="primary"
          :disabled="state.submitting">
          {{ state.submitting ? 'Creating…' : 'Create board' }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { DEFAULT_COLOR } from '~/constants/colors'
import type {
  CreateBoardFailure,
  CreateBoardPageDeps,
} from '~/sections/boards/create-board/CreateBoardPage.deps'
import { matchResult } from '~/utils/actionResult'
import { assertNever } from '~/utils/assertNever'

const props = defineProps<{
  deps: CreateBoardPageDeps
  onCreated: (boardId: string) => Promise<void> | void
  spaceKey: string
}>()
const organizationRoutes = useOrganizationRoutes()
const state = reactive({
  color: DEFAULT_COLOR,
  error: null as null | string,
  name: '',
  submitting: false,
})
useHead({ title: 'Create board' })

const getFailureMessage = (failure: CreateBoardFailure): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'You do not have permission to create boards.'
    case 'invalidInput':
      return failure.message
    case 'spaceNotFound':
      return 'The space was not found or is not available to you.'
    case 'temporarilyUnavailable':
      return 'Could not create board. Try again.'
    default:
      return assertNever(failure)
  }
}

async function submit(): Promise<void> {
  if (state.submitting) {
    return
  }
  state.submitting = true
  state.error = null
  try {
    const result = await props.deps.create({
      color: state.color,
      name: state.name.trim(),
      spaceKey: props.spaceKey,
    })
    await matchResult(result, {
      err: (failure) => {
        state.error = getFailureMessage(failure)
      },
      ok: ({ boardId }) => props.onCreated(boardId),
    })
  } finally {
    state.submitting = false
  }
}
</script>
