<template>
  <LoginPage
    :bot-name="botName"
    :error="error"
    :submitting="submitting"
    @login="loginViaTelegramWidget" />
</template>

<script setup lang="ts">
import type { LoginViaTelegramWidgetInput } from './actions/loginViaTelegramWidget'
import type { LoginPageApplicationDeps } from './LoginPageApplicationDeps'
import LoginPage from './view/LoginPage.vue'

const props = defineProps<{ botName: string; deps: LoginPageApplicationDeps }>()
useHead({ title: 'Sign in' })
const submitting = ref(false)
const error = ref<null | string>(null)
const invalidation = useAsyncDataInvalidation()
const setLoginError = (
  actionError: 'InvalidTelegramData' | 'TemporarilyUnavailable',
) => {
  error.value = getErrorMessage({
    error: actionError,
    messages: {
      InvalidTelegramData: 'Telegram sign-in data is invalid or has expired.',
      TemporarilyUnavailable: 'Could not sign in with Telegram. Try again.',
    },
  })
}
const finishLogin = async () => {
  invalidation.resetAllData()
  await navigateTo('/organizations')
}
const loginViaTelegramMiniApp = async () => {
  submitting.value = true
  const result = await props.deps.loginViaTelegramMiniApp()
  await matchActionResult({
    err: setLoginError,
    ok: async (authenticated) => {
      error.value = null
      if (authenticated) {
        await finishLogin()
      }
    },
    result,
  })
  submitting.value = false
}
const loginViaTelegramWidget = async (input: LoginViaTelegramWidgetInput) => {
  if (submitting.value) {
    return
  }
  submitting.value = true
  const result = await props.deps.loginViaTelegramWidget(input)
  await matchActionResult({
    err: setLoginError,
    ok: async () => {
      error.value = null
      await finishLogin()
    },
    result,
  })
  submitting.value = false
}
onMounted(() => loginViaTelegramMiniApp())
</script>
