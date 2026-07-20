<template>
  <LoginPage
    :bot-name="config.public.botName"
    :deps="deps" />
</template>

<script setup lang="ts">
import { openApiLoginViaTelegramMiniApp } from '#infrastructure/auth/login/openApiLoginViaTelegramMiniApp'
import { openApiLoginViaTelegramWidget } from '#infrastructure/auth/login/openApiLoginViaTelegramWidget'
import LoginPage from '~/sections/auth/login/LoginPage.vue'

definePageMeta({ layout: false })
const config = useRuntimeConfig()
const deps = {
  loginViaTelegramMiniApp: openApiLoginViaTelegramMiniApp({
    baseUrl: config.public.boardsApiBaseUrl,
    testInitData: import.meta.dev ? config.public.testUserToken : undefined,
  }),
  loginViaTelegramWidget: openApiLoginViaTelegramWidget(
    config.public.boardsApiBaseUrl,
  ),
}
</script>
