<template>
  <section class="org-picker">
    <div class="picker-card form-page">
      <NuxtLink
        class="logo"
        to="/organizations">
        <img
          alt=""
          class="logo-mark"
          src="/favicon.svg" />
        <span>Laraue Boards</span>
      </NuxtLink>
      <div class="page-heading">
        <AppBackLink
          label="Back to organizations"
          to="/organizations" />
        <div class="page-heading-text">
          <h1>Create organization</h1>
        </div>
      </div>
      <p class="muted">Create a new workspace for your team.</p>
      <form @submit.prevent="submit">
        <label>Name</label>
        <input
          v-model="state.name"
          required />
        <label>Slug</label>
        <input
          v-model="state.slug"
          pattern="[a-z0-9-]+"
          placeholder="acme-studio"
          required />
        <label>Color</label>
        <AppColorPicker v-model="state.color" />
        <p
          v-if="state.error"
          class="form-error">
          {{ state.error }}
        </p>
        <div class="form-actions">
          <NuxtLink
            class="secondary"
            to="/organizations">
            Cancel
          </NuxtLink>
          <button
            class="primary"
            :disabled="state.submitting">
            {{ state.submitting ? 'Creating…' : 'Create organization' }}
          </button>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { DEFAULT_COLOR } from '~/constants/colors'
import type {
  CreateOrganizationFailure,
  CreateOrganizationPageDeps,
} from '~/sections/organizations/create-organization/CreateOrganizationPage.deps'
import { matchResult } from '~/utils/actionResult'
import { assertNever } from '~/utils/assertNever'

const props = defineProps<{
  deps: CreateOrganizationPageDeps
  onCreated: () => Promise<void> | void
}>()
const state = reactive({
  color: DEFAULT_COLOR,
  error: null as null | string,
  name: '',
  slug: '',
  submitting: false,
})
useHead({ title: 'Create organization' })

function getFailureMessage(failure: CreateOrganizationFailure): string {
  switch (failure.type) {
    case 'accessDenied':
      return 'Sign in to create an organization.'
    case 'invalidInput':
      return failure.message
    case 'temporarilyUnavailable':
      return 'Could not create organization. Try again.'
    default:
      return assertNever(failure)
  }
}

async function submit() {
  if (state.submitting) {
    return
  }
  state.submitting = true
  state.error = null
  try {
    await matchResult(
      await props.deps.create({
        color: state.color,
        name: state.name.trim(),
        slug: state.slug.trim(),
      }),
      {
        err: (failure) => {
          state.error = getFailureMessage(failure)
        },
        ok: props.onCreated,
      },
    )
  } finally {
    state.submitting = false
  }
}
</script>

<style scoped>
.org-picker {
  display: grid;
  min-height: 100vh;
  padding: var(--space-6);
  place-items: center;
}

.picker-card {
  width: min(var(--form-page-max-width), 100%);
}

.picker-card > .logo {
  margin-bottom: 48px;
}
</style>
