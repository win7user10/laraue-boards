<template>
  <PageState
    error-title="Could not load settings"
    loading-text="Loading settings…"
    :on-retry="query.refresh"
    :state="pageState">
    <template #default="{ data }">
      <section class="form-page">
        <div class="title-row">
          <div class="page-heading">
            <Settings class="page-heading-icon" />
            <div class="page-heading-text">
              <h1>General settings</h1>
            </div>
          </div>
        </div>
        <form
          @submit.prevent="
            submit({
              id: data.id,
              name: state.name.trim(),
              color: state.color,
              slug: data.slug,
            })
          ">
          <label>Name</label>
          <input
            v-model="state.name"
            :disabled="!data.canUpdate"
            required />
          <label>Color</label>
          <AppColorPicker
            v-model="state.color"
            :disabled="!data.canUpdate" />
          <p
            v-if="state.saved"
            class="form-success">
            Changes saved.
          </p>
          <p
            v-if="state.mutationError"
            class="form-error">
            {{ state.mutationError }}
          </p>
          <div
            v-if="data.canUpdate"
            class="form-actions">
            <button
              class="primary"
              :disabled="state.submitting">
              {{ state.submitting ? 'Saving…' : 'Save changes' }}
            </button>
          </div>
        </form>
      </section>
    </template>
  </PageState>
</template>

<script setup lang="ts">
import { Settings } from 'lucide-vue-next'

import type {
  OrganizationSettingsPageDeps,
  UpdateOrganizationFailure,
  UpdateOrganizationInput,
  ViewOrganizationSettingsFailure,
} from '~/sections/organizations/settings/OrganizationSettingsPage.deps'
import { matchResult } from '~/utils/actionResult'
import { assertNever } from '~/utils/assertNever'
import { toAsyncResultState } from '~/utils/asyncResultState'

const props = defineProps<{
  deps: OrganizationSettingsPageDeps
  onUpdated: () => Promise<void> | void
}>()

const query = await useAsyncData(
  'organization-settings',
  (_nuxtApp, { signal }) => props.deps.view({ signal }),
)

const getViewFailureMessage = (
  failure: ViewOrganizationSettingsFailure,
): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'You do not have access to this organization.'
    case 'organizationNotFound':
      return 'The organization was not found.'
    case 'temporarilyUnavailable':
      return 'Could not load settings. The service is temporarily unavailable.'
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

const state = reactive({
  color: '',
  mutationError: null as null | string,
  name: '',
  saved: false,
  submitting: false,
})

useHead({
  title: computed(() => (state.name ? `${state.name} settings` : 'Settings')),
})

watch(
  pageState,
  (page) => {
    if (page.type !== 'ready') {
      return
    }
    state.color = page.data.color
    state.name = page.data.name
  },
  { immediate: true },
)

const getUpdateFailureMessage = (
  failure: UpdateOrganizationFailure,
): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'You do not have permission to update this organization.'
    case 'organizationNotFound':
      return 'The organization was not found.'
    case 'temporarilyUnavailable':
      return 'Could not save changes. Try again.'
    case 'invalidInput':
      return failure.message
    default:
      return assertNever(failure)
  }
}

async function submit(input: UpdateOrganizationInput): Promise<void> {
  if (state.submitting) {
    return
  }

  state.submitting = true
  state.saved = false
  state.mutationError = null

  try {
    const result = await props.deps.updateOrganization(input)
    await matchResult(result, {
      err: (failure) => {
        state.mutationError = getUpdateFailureMessage(failure)
      },
      ok: async () => {
        await props.onUpdated()
        state.saved = true
      },
    })
  } finally {
    state.submitting = false
  }
}
</script>

<style scoped>
.form-page > form {
  margin-top: var(--space-6);
}
</style>
