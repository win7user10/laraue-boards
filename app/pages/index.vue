<template>
  <LoginPage
    :bot-name="config.public.botName"
    :deps="deps"
    :on-logged-in="onLoggedIn" />
</template>

<script setup lang="ts">
import { createLoginPageDeps } from '~/sections/auth/login/LoginPage.deps.impl'
import LoginPage from '~/sections/auth/login/LoginPage.vue'

definePageMeta({ layout: false })
const config = useRuntimeConfig()
const client = useApiClient()
const deps = createLoginPageDeps(client, import.meta.dev ? config.public.testUserToken : undefined)
const onLoggedIn = async (): Promise<void> => {
  await navigateTo('/organizations')
}
</script>
