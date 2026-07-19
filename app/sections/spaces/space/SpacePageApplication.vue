<template>
  <SpacePage
    v-if="pageState.type === 'ready'"
    :view-model="pageState.data.SpacePage" />
  <PageLoadState
    v-else
    :error-text="pageState.type === 'error' ? pageState.message : ''"
    :loading="pageState.type === 'pending'"
    loading-text="Loading space…"
    @retry="refresh()" />
</template>

<script setup lang="ts">
import type { SpacePageApplicationDeps } from './SpacePageApplicationDeps'
import SpacePage from './view/SpacePage.vue'

const props = defineProps<{
  deps: SpacePageApplicationDeps
  spaceKey: string
}>()
const { refresh, state: pageState } = await useActionData({
  action: () => props.deps.viewSpacePage({ spaceKey: props.spaceKey }),
  fallbackMessage: 'Could not load space. Try again.',
  key: () => asyncDataKeys.space.view(props.spaceKey),
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
      ? pageState.value.data.SpacePage.name
      : 'Space',
  ),
})
</script>
