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
import type { CreateSpacePageDeps } from '~/sections/spaces/create-space/CreateSpacePageDeps'

const props = defineProps<{ deps: CreateSpacePageDeps }>()
const organizationRoutes = useOrganizationRoutes()
const state = reactive({
  color: DEFAULT_COLOR,
  error: null as null | string,
  key: '',
  name: '',
  submitting: false,
})
useHead({ title: 'Create space' })

async function submit() {
  state.submitting = true
  state.error = null
  const result = await props.deps.createSpace({
    color: state.color,
    key: state.key.trim(),
    name: state.name.trim(),
  })
  state.submitting = false
  await matchActionResult({
    err: async (error) => {
      state.error = getErrorMessage({
        error,
        messages: {
          AccessDenied: 'You do not have permission to create spaces.',
          OrganizationNotFound: 'The organization was not found.',
          TemporarilyUnavailable: 'Could not create space. Try again.',
        },
      })
    },
    ok: async ({ spaceKey }) => {
      invalidateData({ scope: 'structure' })
      await refreshDataKey(
        dataKeys.workspace.layout(organizationRoutes.organizationKey.value),
      )
      await navigateTo(organizationRoutes.space(spaceKey))
    },
    result,
  })
}
</script>
