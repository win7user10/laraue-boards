<template>
  <SpaceSettingsPage
    v-if="pageState.type === 'ready'"
    :error="error"
    :submitting="submitting"
    :view-model="pageState.data.SpaceSettingsPage"
    @delete="remove"
    @update="update" />
  <PageLoadState
    v-else
    :error-text="pageState.type === 'error' ? pageState.message : ''"
    :loading="pageState.type === 'pending'"
    loading-text="Loading space…"
    @retry="refresh()" />
</template>
<script setup lang="ts">
import type { SpaceSettingsPageApplicationDeps } from './SpaceSettingsPageApplicationDeps'
import SpaceSettingsPage from './view/SpaceSettingsPage.vue'
const props = defineProps<{
  deps: SpaceSettingsPageApplicationDeps
  spaceKey: string
}>()
const organizationRoutes = useOrganizationRoutes()
const { refresh, state: pageState } = await useActionData({
  action: () => props.deps.viewSpaceSettingsPage({ spaceKey: props.spaceKey }),
  fallbackMessage: 'Could not load space. Try again.',
  key: () => asyncDataKeys.space.settings(props.spaceKey),
  messages: {
    AccessDenied: 'You do not have access to this space.',
    SpaceNotFound: 'The space was not found or is not available to you.',
    TemporarilyUnavailable:
      'Could not load space. The service is temporarily unavailable.',
  },
  watch: [() => props.spaceKey],
})
useHead({
  title: computed(() =>
    pageState.value.type === 'ready'
      ? `${pageState.value.data.SpaceSettingsPage.name} settings`
      : 'Space settings',
  ),
})
const submitting = ref(false)
const error = ref<null | string>(null)
const invalidation = useAsyncDataInvalidation()
async function update(input: { color: string; key: string; name: string }) {
  if (pageState.value.type !== 'ready') {
    return
  }
  submitting.value = true
  error.value = null
  const result = await props.deps.updateSpace({
    spaceId: pageState.value.data.SpaceSettingsPage.id,
    ...input,
  })
  submitting.value = false
  await matchActionResult({
    err: async (actionError) => {
      error.value = getErrorMessage({
        error: actionError,
        messages: {
          AccessDenied: 'You do not have permission to update this space.',
          SpaceNotFound: 'The space was not found.',
          TemporarilyUnavailable: 'Could not save space. Try again.',
        },
      })
    },
    ok: async () => {
      await invalidation.invalidateWorkspaceStructure()
      await navigateTo(organizationRoutes.space(input.key))
    },
    result,
  })
}
async function remove() {
  if (!confirm('Delete this space?')) {
    return
  }
  if (pageState.value.type !== 'ready') {
    return
  }
  submitting.value = true
  const result = await props.deps.deleteSpace({
    spaceId: pageState.value.data.SpaceSettingsPage.id,
  })
  submitting.value = false
  await matchActionResult({
    err: async (actionError) => {
      error.value = getErrorMessage({
        error: actionError,
        messages: {
          AccessDenied: 'You do not have permission to delete this space.',
          SpaceNotFound: 'This space no longer exists.',
          TemporarilyUnavailable: 'Could not delete space. Try again.',
        },
      })
    },
    ok: async () => {
      await invalidation.invalidateWorkspaceStructure()
      await navigateTo(organizationRoutes.issues())
    },
    result,
  })
}
</script>
