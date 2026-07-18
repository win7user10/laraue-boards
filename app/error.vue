<template>
  <AppErrorState
    :code="`Error ${statusCode}`"
    :message="message"
    :title="title">
    <button
      class="primary"
      type="button"
      @click="retry">
      <RefreshCw />
      Try again
    </button>
    <button
      class="secondary"
      type="button"
      @click="goHome">
      <House />
      Go home
    </button>
  </AppErrorState>
</template>

<script setup lang="ts">
import { House, RefreshCw } from 'lucide-vue-next'

import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const statusCode = computed(() => Number(props.error.statusCode) || 500)
const title = computed(() => {
  if (statusCode.value === 401) {
    return 'Sign in required'
  }
  if (statusCode.value === 403) {
    return 'Access denied'
  }
  if (statusCode.value === 404) {
    return 'Page not found'
  }
  if (statusCode.value < 500) {
    return 'Request could not be completed'
  }
  return 'Something went wrong'
})
useHead({ title: computed(() => `${title.value} · Laraue Boards`) })
const message = computed(() => {
  if (statusCode.value === 401) {
    return 'Your session is missing or has expired.'
  }
  if (statusCode.value === 403) {
    return 'You do not have permission to open this page.'
  }
  if (statusCode.value === 404) {
    return 'The page may have moved, or the link may be incorrect.'
  }
  if (statusCode.value < 500) {
    return 'Check the address and try your request again.'
  }
  return 'The service is temporarily unavailable. Please try again.'
})

const retry = () => globalThis.location.reload()
const goHome = () => clearError({ redirect: '/' })
</script>
