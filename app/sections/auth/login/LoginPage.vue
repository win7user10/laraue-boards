<template>
  <section class="auth">
    <div class="auth-art">
      <div class="logo">
        <img
          alt=""
          class="logo-mark"
          src="/favicon.svg" />
        <span>Laraue Boards</span>
      </div>
      <div class="auth-copy">
        <h1>Turn messages into work.</h1>
        <p>
          Send Telegram messages to organized boards and keep every important
          request moving.
        </p>
        <div class="auth-flow">
          <span class="auth-flow-step">
            <MessageCircle aria-hidden="true" />
            Message
          </span>
          <ArrowRight
            aria-hidden="true"
            class="auth-flow-arrow" />
          <span class="auth-flow-step">
            <SquareKanban aria-hidden="true" />
            Issue
          </span>
          <ArrowRight
            aria-hidden="true"
            class="auth-flow-arrow" />
          <span class="auth-flow-step">
            <CircleCheck aria-hidden="true" />
            Done
          </span>
        </div>
      </div>
      <small>Your conversations stay in Telegram. Your work stays clear.</small>
    </div>
    <div
      :aria-busy="state.submitting"
      class="auth-card">
      <div class="logo">
        <img
          alt=""
          class="logo-mark"
          src="/favicon.svg" />
        <span>Laraue Boards</span>
      </div>
      <h2>Welcome back</h2>
      <p class="muted">Use your Telegram account to continue.</p>
      <p
        v-if="state.error"
        class="form-error">
        {{ state.error }}
      </p>
      <p
        v-if="state.submitting"
        class="muted login-status">
        Signing in…
      </p>
      <div
        ref="widgetContainer"
        class="telegram-widget" />
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  ArrowRight,
  CircleCheck,
  MessageCircle,
  SquareKanban,
} from 'lucide-vue-next'

import type { LoginViaTelegramWidgetInput } from '~/sections/auth/login/deps/loginViaTelegramWidget'
import type { LoginPageDeps } from '~/sections/auth/login/LoginPageDeps'

type TelegramUser = {
  auth_date: number
  first_name: string
  hash: string
  id: number
  last_name?: string
  photo_url?: string
  username?: string
}

const props = defineProps<{ botName: string; deps: LoginPageDeps }>()
const widgetContainer = ref<HTMLElement | null>(null)
const state = reactive({ error: null as null | string, submitting: false })
const telegramWindow = globalThis as typeof globalThis & {
  onTelegramAuth?: (user: TelegramUser) => void
}

onMounted(() => {
  telegramWindow.onTelegramAuth = loginViaTelegramWidget

  const script = document.createElement('script')
  script.async = true
  script.src = 'https://telegram.org/js/telegram-widget.js?22'
  script.setAttribute('data-telegram-login', props.botName)
  script.setAttribute('data-size', 'large')
  script.setAttribute('data-onauth', 'onTelegramAuth(user)')
  script.setAttribute('data-request-access', 'write')
  script.setAttribute('data-radius', '10')
  script.setAttribute('data-userpic', 'true')
  widgetContainer.value?.appendChild(script)
})

onBeforeUnmount(() => delete telegramWindow.onTelegramAuth)
onMounted(loginViaTelegramMiniApp)
useHead({ title: 'Sign in' })

function setLoginError(
  error: 'InvalidTelegramData' | 'TemporarilyUnavailable',
) {
  state.error = getErrorMessage({
    error,
    messages: {
      InvalidTelegramData: 'Telegram sign-in data is invalid or has expired.',
      TemporarilyUnavailable: 'Could not sign in with Telegram. Try again.',
    },
  })
}

async function finishLogin() {
  invalidateAllData()
  await navigateTo('/organizations')
}

async function loginViaTelegramMiniApp() {
  state.submitting = true
  const result = await props.deps.loginViaTelegramMiniApp()
  await matchActionResult({
    err: setLoginError,
    ok: async (authenticated) => {
      state.error = null
      if (authenticated) {
        await finishLogin()
      }
    },
    result,
  })
  state.submitting = false
}

async function loginViaTelegramWidget(input: LoginViaTelegramWidgetInput) {
  if (state.submitting) {
    return
  }
  state.submitting = true
  const result = await props.deps.loginViaTelegramWidget(input)
  await matchActionResult({
    err: setLoginError,
    ok: async () => {
      state.error = null
      await finishLogin()
    },
    result,
  })
  state.submitting = false
}
</script>

<style scoped>
.auth {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  min-height: 100vh;
}

.auth-art {
  background: #172554
    radial-gradient(circle at 25% 25%, #3156d3, transparent 45%);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: clamp(32px, 5vw, 64px);
}

.auth-art .logo {
  color: white;
}

.auth-copy {
  display: grid;
  gap: var(--space-4);
  max-width: min(900px, 50vw);
  text-wrap: balance;
}

.auth-flow {
  align-items: center;
  display: grid;
  gap: clamp(var(--space-1), 0.8vw, var(--space-3));
  grid-template-columns: repeat(5, auto);
  justify-content: start;
  margin-top: var(--space-4);
}

.auth-flow-step {
  align-items: center;
  background: #ffffff12;
  border: 1px solid #ffffff24;
  border-radius: var(--radius-control);
  display: flex;
  font-size: clamp(12px, 1vw, 14px);
  font-weight: var(--font-weight-semibold);
  gap: var(--space-2);
  padding: var(--space-3);
}

.auth-flow-arrow {
  color: #93c5fd;
}

.auth-art h1 {
  font-size: clamp(42px, 5vw, 72px);
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin: 0;
  overflow: visible;
  white-space: normal;
}

.auth-art p {
  color: #cbd5e1;
  font-size: clamp(15px, 1.2vw, 18px);
}

.auth-card {
  margin: auto;
  width: min(380px, calc(100% - 48px));
}

.auth-card > .logo {
  display: none;
}

.auth-card h2 {
  font-size: 28px;
  letter-spacing: -0.02em;
  margin-bottom: var(--space-2);
}

.login-status {
  margin-top: var(--space-6);
  text-align: center;
}

.telegram-widget {
  display: flex;
  margin-top: var(--space-6);
  min-height: 48px;
}

@media (max-width: 760px) {
  .auth {
    grid-template-columns: 1fr;
  }

  .auth-art {
    display: none;
  }

  .auth-card {
    width: min(380px, calc(100% - 32px));
  }

  .auth-card > .logo {
    display: flex;
  }
}
</style>
