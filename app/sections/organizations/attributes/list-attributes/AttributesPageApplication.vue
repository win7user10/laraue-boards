<template>
  <AttributesPage
    v-if="pageState.type === 'ready'"
    :view-model="pageState.data.AttributesPage" />
  <PageLoadState
    v-else
    :error-text="pageState.type === 'error' ? pageState.message : ''"
    :loading="pageState.type === 'pending'"
    loading-text="Loading attributes…"
    @retry="refresh()" />
</template>

<script setup lang="ts">
import type { AttributesPageApplicationDeps } from './AttributesPageApplicationDeps'
import AttributesPage from './view/AttributesPage.vue'

const props = defineProps<{ deps: AttributesPageApplicationDeps }>()
useHead({ title: 'Attributes' })
const { refresh, state: pageState } = await useActionData({
  action: () => props.deps.viewAttributesPage(),
  fallbackMessage:
    'Could not load attributes. The service is temporarily unavailable.',
  key: asyncDataKeys.workspace.attributes,
  messages: {
    AccessDenied: 'You do not have permission to manage attributes.',
    TemporarilyUnavailable:
      'Could not load attributes. The service is temporarily unavailable.',
  },
})
</script>
