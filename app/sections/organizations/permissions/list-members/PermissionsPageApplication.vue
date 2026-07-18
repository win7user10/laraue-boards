<template>
  <PermissionsPage
    v-if="pageState.type === 'ready'"
    :view-model="pageState.data.PermissionsPage" />
  <PageLoadState
    v-else
    :error-text="pageState.type === 'error' ? pageState.message : ''"
    :loading="pageState.type === 'pending'"
    loading-text="Loading permissions…"
    @retry="refresh()" />
</template>

<script setup lang="ts">
import type { PermissionsPageApplicationDeps } from './PermissionsPageApplicationDeps'
import PermissionsPage from './view/PermissionsPage.vue'

const props = defineProps<{ deps: PermissionsPageApplicationDeps }>()
useHead({ title: 'Permissions' })
const { refresh, state: pageState } = await useActionData({
  action: () => props.deps.viewPermissionsPage(),
  fallbackMessage:
    'Could not load permissions. The service is temporarily unavailable.',
  key: asyncDataKeys.workspace.permissions,
  messages: {
    AccessDenied: 'You do not have permission to open this page.',
    PermissionsNotFound: 'The requested page was not found.',
    TemporarilyUnavailable:
      'Could not load permissions. The service is temporarily unavailable.',
  },
})
</script>
