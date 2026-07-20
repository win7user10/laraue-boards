<template>
  <AppLayoutContent
    v-if="pageState.type === 'ready'"
    :on-logout="logout"
    :view-model="pageState.data.AppLayout">
    <slot />
  </AppLayoutContent>
  <PageLoadState
    v-else-if="
      pageState.type === 'pending' ||
      (pageState.type === 'error' &&
        pageState.error === 'OrganizationSwitchRequired')
    "
    error-text=""
    :loading="true"
    loading-text="Loading workspace…" />
  <AppErrorState
    v-else
    code="Workspace error"
    :message="pageState.message"
    :title="errorTitle">
    <button
      v-if="pageState.error === 'AccessDenied'"
      class="primary"
      type="button"
      @click="signInAgain">
      <LogIn />
      Sign in again
    </button>
    <button
      class="secondary"
      type="button"
      @click="refresh()">
      <RefreshCw />
      Try again
    </button>
  </AppErrorState>
</template>

<script setup lang="ts">
import { LogIn, RefreshCw } from 'lucide-vue-next'

import type { AppLayoutDeps } from '~/sections/common/app-layout/AppLayoutDeps'
import AppLayoutContent from '~/sections/common/app-layout/components/AppLayoutContent.vue'

const props = defineProps<{
  deps: AppLayoutDeps
  organizationKey: string
}>()
const {
  actionResult,
  refresh,
  state: pageState,
} = await useActionData({
  action: () =>
    props.deps.viewLayout({ organizationKey: props.organizationKey }),
  fallbackMessage: 'Workspace is unavailable. Try again.',
  key: () => dataKeys.workspace.layout(props.organizationKey),
  messages: {
    AccessDenied:
      'Your session has expired. Sign in and select your organization again.',
    OrganizationSwitchRequired: 'Switching organization…',
    TemporarilyUnavailable:
      'Workspace is unavailable. Check your connection and try again.',
    WorkspaceNotFound:
      'The workspace may have moved or is no longer available.',
  },
})
onNuxtReady(async () => {
  const result = actionResult.value
  if (!result) {
    await refresh()
    return
  }
  const organizationSwitchRequired = matchActionResult({
    err: (error) => error === 'OrganizationSwitchRequired',
    ok: () => false,
    result,
  })
  if (!organizationSwitchRequired) {
    return
  }

  await refresh()
  const refreshedResult = actionResult.value
  if (!refreshedResult) {
    return
  }
  matchActionResult({
    err: () => undefined,
    ok: () => window.location.reload(),
    result: refreshedResult,
  })
})
const errorTitle = computed(() =>
  pageState.value.type === 'error' && pageState.value.error
    ? getErrorMessage({
        error: pageState.value.error,
        messages: {
          AccessDenied: 'Sign in required',
          OrganizationSwitchRequired: 'Switching organization',
          TemporarilyUnavailable: 'Something went wrong',
          WorkspaceNotFound: 'Workspace not found',
        },
      })
    : 'Could not load workspace',
)
const logout = async () => {
  await props.deps.logout()
  invalidateAllData()
  await navigateTo('/')
}
const signInAgain = logout
</script>
