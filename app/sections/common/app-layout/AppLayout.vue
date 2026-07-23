<template>
  <AppLayoutContent
    v-if="pageState.type === 'ready'"
    :on-logout="logout"
    :view-model="pageState.data">
    <slot />
  </AppLayoutContent>
  <PageLoadState
    v-else-if="
      pageState.type === 'pending' ||
      (pageState.type === 'error' &&
        pageState.error.type === 'organizationSwitchRequired')
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
      v-if="pageState.error.type === 'accessDenied'"
      class="primary"
      type="button"
      @click="logout">
      <LogIn />
      Sign in again
    </button>
    <button
      class="secondary"
      type="button"
      @click="query.refresh()">
      <RefreshCw />
      Try again
    </button>
  </AppErrorState>
</template>

<script setup lang="ts">
import { LogIn, RefreshCw } from 'lucide-vue-next'

import type {
  AppLayoutDeps,
  ViewAppLayoutFailure,
} from '~/sections/common/app-layout/AppLayout.deps'
import AppLayoutContent from '~/sections/common/app-layout/components/AppLayoutContent.vue'
import { matchResult } from '~/utils/actionResult'
import { assertNever } from '~/utils/assertNever'
import { toAsyncResultState } from '~/utils/asyncResultState'

const props = defineProps<{
  deps: AppLayoutDeps
  onLoggedOut: () => Promise<void> | void
  organizationKey: string
}>()
const state = reactive({ loggingOut: false })

const query = await useAsyncData(
  appLayoutDataKey,
  (_nuxtApp, { signal }) =>
    props.deps.view({ organizationKey: props.organizationKey, signal }),
  { watch: [() => props.organizationKey] },
)
const getFailureMessage = (failure: ViewAppLayoutFailure): string => {
  switch (failure.type) {
    case 'accessDenied':
      return 'Your session has expired. Sign in and select your organization again.'
    case 'organizationSwitchRequired':
      return 'Switching organization…'
    case 'temporarilyUnavailable':
      return 'Workspace is unavailable. Check your connection and try again.'
    case 'workspaceNotFound':
      return 'The workspace may have moved or is no longer available.'
    default:
      return assertNever(failure)
  }
}
const pageState = computed(() =>
  toAsyncResultState({
    error: query.error.value,
    getErrorMessage: getFailureMessage,
    result: query.data.value,
    status: query.status.value,
  }),
)

onNuxtReady(async () => {
  const result = query.data.value
  if (!result) {
    await query.refresh()
    return
  }
  const switchRequired = matchResult(result, {
    err: (failure) => failure.type === 'organizationSwitchRequired',
    ok: () => false,
  })
  if (!switchRequired) {
    return
  }

  await query.refresh()
  const refreshedResult = query.data.value
  if (refreshedResult?.ok) {
    window.location.reload()
  }
})

const errorTitle = computed(() => {
  if (pageState.value.type !== 'error') {
    return 'Could not load workspace'
  }
  switch (pageState.value.error.type) {
    case 'accessDenied':
      return 'Sign in required'
    case 'organizationSwitchRequired':
      return 'Switching organization'
    case 'temporarilyUnavailable':
      return 'Something went wrong'
    case 'workspaceNotFound':
      return 'Workspace not found'
    default:
      return assertNever(pageState.value.error)
  }
})

const logout = async (): Promise<void> => {
  if (state.loggingOut) {
    return
  }
  state.loggingOut = true
  try {
    await props.deps.logout()
    await props.onLoggedOut()
  } finally {
    state.loggingOut = false
  }
}
</script>
