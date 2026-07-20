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
import type { CreateBoardPageDeps } from '~/sections/boards/create-board/CreateBoardPageDeps'

const props = defineProps<{ deps: CreateBoardPageDeps; spaceKey: string }>()
const organizationRoutes = useOrganizationRoutes()
const state = reactive({
  color: DEFAULT_COLOR,
  error: null as null | string,
  name: '',
  submitting: false,
})
useHead({ title: 'Create board' })

async function submit() {
  state.submitting = true
  state.error = null
  const result = await props.deps.createBoard({
    color: state.color,
    name: state.name.trim(),
    spaceKey: props.spaceKey,
  })
  state.submitting = false
  await matchActionResult({
    err: async (error) => {
      state.error = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have permission to create boards.',
          SpaceNotFound: 'The space was not found or is not available to you.',
          TemporarilyUnavailable: 'Could not create board. Try again.',
        },
      })
    },
    ok: async ({ boardId }) => {
      invalidateData({ scope: 'structure' })
      await navigateTo(organizationRoutes.board(props.spaceKey, boardId))
    },
    result,
  })
}
</script>
