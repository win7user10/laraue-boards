<template>
  <PageState
    error-title="Could not load space"
    loading-text="Loading space…"
    :on-retry="query.refresh"
    :state="pageState">
    <template #default="{ data }">
      <section class="form-page">
        <div class="title-row">
          <div class="page-heading">
            <AppBackLink
              label="Back to space"
              :to="organizationRoutes.space(spaceKey)" />
            <SpaceIcon
              class="page-heading-icon"
              :style="{ color: state.color }" />
            <div class="page-heading-text"><h1>Edit space</h1></div>
          </div>
        </div>
        <form @submit.prevent="update">
          <label>Name</label>
          <input
            v-model="state.name"
            :disabled="!data.canUpdate"
            required />
          <label>Key</label>
          <input
            v-model="state.key"
            :disabled="!data.canUpdate"
            required />
          <label>Color</label>
          <AppColorPicker
            v-model="state.color"
            :disabled="!data.canUpdate" />
          <p
            v-if="state.error"
            class="form-error">
            {{ state.error }}
          </p>
          <div class="form-actions">
            <button
              v-if="data.canUpdate"
              class="primary"
              :disabled="state.submitting"
              type="submit">
              {{ state.submitting ? 'Saving…' : 'Save changes' }}
            </button>
            <button
              v-if="data.canDelete"
              class="secondary danger"
              :disabled="state.submitting"
              type="button"
              @click="remove">
              Delete space
            </button>
          </div>
        </form>
      </section>
    </template>
  </PageState>
</template>

<script setup lang="ts">
import { SpaceIcon } from '~/constants/icons'
import type {
  ChangeSpaceFailure,
  SpaceSettingsPageDeps,
  UpdateSpaceFailure,
  ViewSpaceSettingsFailure,
} from '~/sections/spaces/space-settings/SpaceSettingsPage.deps'
import { matchResult } from '~/utils/actionResult'
import { assertNever } from '~/utils/assertNever'
import { toAsyncResultState } from '~/utils/asyncResultState'

const props = defineProps<{
  deps: SpaceSettingsPageDeps
  onDeleted: () => Promise<void> | void
  onUpdated: (spaceKey: string) => Promise<void> | void
  spaceKey: string
}>()
const state = reactive({
  color: '',
  error: null as null | string,
  key: '',
  name: '',
  submitting: false,
})
const organizationRoutes = useOrganizationRoutes()

const query = await useAsyncData(
  () => `space-settings:${props.spaceKey}`,
  (_nuxtApp, { signal }) => props.deps.view({ signal, spaceKey: props.spaceKey }),
  { watch: [() => props.spaceKey] },
)
const getViewFailureMessage = (failure: ViewSpaceSettingsFailure): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'You do not have access to this space.'
    case 'spaceNotFound':
      return 'The space was not found or is not available to you.'
    case 'temporarilyUnavailable':
      return 'Could not load space. The service is temporarily unavailable.'
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
const page = computed(() => (pageState.value.type === 'ready' ? pageState.value.data : null))

watch(
  page,
  (value) => {
    if (!value) {
      return
    }
    state.color = value.color
    state.key = value.spaceKey
    state.name = value.name
  },
  { immediate: true },
)

useHead({
  title: computed(() => (page.value ? `${page.value.name} settings` : 'Space settings')),
})

const getChangeFailureMessage = (
  failure: ChangeSpaceFailure,
  operation: 'delete' | 'update',
): string => {
  switch (failure.type) {
    case 'accessDenied':
      return `You do not have permission to ${operation} this space.`
    case 'spaceNotFound':
      return operation === 'delete' ? 'This space no longer exists.' : 'The space was not found.'
    case 'temporarilyUnavailable':
      return `Could not ${operation === 'delete' ? 'delete' : 'save'} space. Try again.`
    default:
      return assertNever(failure)
  }
}

const getUpdateFailureMessage = (failure: UpdateSpaceFailure): string =>
  failure.type === 'invalidInput' ? failure.message : getChangeFailureMessage(failure, 'update')

async function update(): Promise<void> {
  const current = page.value
  if (!current || state.submitting) {
    return
  }
  state.error = null
  state.submitting = true
  try {
    const key = state.key.trim()
    const result = await props.deps.update({
      color: state.color,
      key,
      name: state.name.trim(),
      spaceId: current.id,
    })
    await matchResult(result, {
      err: (failure) => (state.error = getUpdateFailureMessage(failure)),
      ok: () => props.onUpdated(key),
    })
  } finally {
    state.submitting = false
  }
}

async function remove(): Promise<void> {
  const current = page.value
  if (!current || state.submitting || !confirm('Delete this space?')) {
    return
  }
  state.error = null
  state.submitting = true
  try {
    const result = await props.deps.delete({ spaceId: current.id })
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
