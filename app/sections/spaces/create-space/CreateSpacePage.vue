<template>
  <section class="form-page">
    <div class="page-heading">
      <div class="page-heading-text">
        <h1>Create space</h1>
      </div>
    </div>
    <form @submit.prevent="submit">
      <label>Name</label>
      <input
        v-model="state.name"
        required />
      <label>Key</label>
      <input
        v-model="state.key"
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
          {{ state.submitting ? 'Creating…' : 'Create space' }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { DEFAULT_COLOR } from '~/constants/colors'
import type {
  CreateSpaceFailure,
  CreateSpacePageDeps,
} from '~/sections/spaces/create-space/CreateSpacePage.deps'
import { matchResult } from '~/utils/actionResult'
import { assertNever } from '~/utils/assertNever'

const props = defineProps<{
  deps: CreateSpacePageDeps
  onCreated: (spaceKey: string) => Promise<void> | void
}>()
const state = reactive({
  color: DEFAULT_COLOR,
  error: null as null | string,
  key: '',
  name: '',
  submitting: false,
})
useHead({ title: 'Create space' })

const getFailureMessage = (failure: CreateSpaceFailure): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'You do not have permission to create spaces.'
    case 'invalidInput':
      return failure.message
    case 'organizationNotFound':
      return 'The organization was not found.'
    case 'temporarilyUnavailable':
      return 'Could not create space. Try again.'
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
      key: state.key.trim(),
      name: state.name.trim(),
    })
    await matchResult(result, {
      err: (failure) => {
        state.error = getFailureMessage(failure)
      },
      ok: ({ spaceKey }) => props.onCreated(spaceKey),
    })
  } finally {
    state.submitting = false
  }
}
</script>
