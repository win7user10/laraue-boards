<template>
  <SpaceSettingsContent
    v-if="pageState.type === 'ready'"
    :error="error"
    :on-delete="remove"
    :on-update="update"
    :submitting="submitting"
    :view-model="pageState.data.SpaceSettingsPage" />
  <PageLoadState
    v-else
    :error-text="pageState.type === 'error' ? pageState.message : ''"
    :loading="pageState.type === 'pending'"
    loading-text="Loading space…"
    :on-retry="refresh" />
</template>

<script setup lang="ts">
import SpaceSettingsContent from '~/sections/spaces/space-settings/components/SpaceSettingsContent.vue'
import type { SpaceSettingsPageDeps } from '~/sections/spaces/space-settings/SpaceSettingsPageDeps'
const props = defineProps<{
  deps: SpaceSettingsPageDeps
  spaceKey: string
}>()
const organizationRoutes = useOrganizationRoutes()
const { refresh, state: pageState } = await useActionData({
  action: () => props.deps.viewSpaceSettingsPage({ spaceKey: props.spaceKey }),
  fallbackMessage: 'Could not load space. Try again.',
  key: () => dataKeys.space.settings(props.spaceKey),
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
let spaceSettingsDataKeyToClear: null | string = null

function invalidateStructureOnLeave(targetDataKey: string) {
  const spaceSettingsDataKey = dataKeys.space.settings(props.spaceKey)
  invalidateData({
    preserve: [spaceSettingsDataKey, targetDataKey],
    scope: 'structure',
  })
  spaceSettingsDataKeyToClear = spaceSettingsDataKey
}

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
      const targetDataKey = dataKeys.space.view(input.key)
      invalidateStructureOnLeave(targetDataKey)
      await refreshDataKey(
        dataKeys.workspace.layout(organizationRoutes.organizationKey.value),
      )
      await navigateTo(organizationRoutes.space(input.key))
      await refreshDataKey(targetDataKey)
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
      const targetDataKey = dataKeys.workspace.issues
      invalidateStructureOnLeave(targetDataKey)
      await refreshDataKey(
        dataKeys.workspace.layout(organizationRoutes.organizationKey.value),
      )
      await navigateTo(organizationRoutes.issues())
      await refreshDataKey(targetDataKey)
    },
    result,
  })
}

onUnmounted(() => {
  if (spaceSettingsDataKeyToClear) {
    invalidateDataKey(spaceSettingsDataKeyToClear)
  }
})
</script>
