<script setup lang="ts">

import {useAppState} from "~/composables/appState";
import {onMounted} from "vue";
import WebApp from "@twa-dev/sdk";

const { appState } = useAppState();
const { t, setLocale, locales } = useI18n();

const isAppInitialized = computed(() => appState.value.isAppInitialized)
const initError = computed(() => appState.value.initError)

onMounted(async () => {
  if (appState.value.isInMiniApp)
    await setupMiniAppWindow()
});

const setupMiniAppWindow = async () => {
  // set launch language based on TG settings
  const language = WebApp.initDataUnsafe.user?.language_code;
  if (locales.value.find(l => l.code == language))
    await setLocale(language as any);

  WebApp.ready();
  WebApp.expand();
  WebApp.requestFullscreen();

  if (WebApp.isFullscreen) {

    // Telegram provides its own inset for the header bar
    const applyInsets = () => {
      let safeTop = WebApp.safeAreaInset?.top ?? 0;
      let safeBottom = WebApp.safeAreaInset?.bottom ?? 0;
      let safeLeft = WebApp.safeAreaInset?.left ?? 0;
      let safeRight = WebApp.safeAreaInset?.right ?? 0;

      // contentSafeAreaInset accounts for Telegram's own header chrome
      document.documentElement.style.setProperty('--safe-top', safeTop + 'px');
      document.documentElement.style.setProperty('--safe-bottom', safeBottom + 'px');
      document.documentElement.style.setProperty('--safe-left', safeLeft + 'px');
      document.documentElement.style.setProperty('--safe-right', safeRight + 'px');
    };

    applyInsets();
    WebApp.onEvent('safeAreaChanged', applyInsets);
    WebApp.onEvent('contentSafeAreaChanged', applyInsets);
  }
}

</script>

<template>
  <div id="app">

    <div v-if="initError">
      {{ initError }}
    </div>

    <div v-else-if="!isAppInitialized" class="loader-overlay">
      <div class="loader-logo">Msg<span>board</span></div>
      <div class="loader-bar"><div class="loader-bar-fill"></div></div>
      <div class="loader-text">{{ t('appInitializing') }}</div>
    </div>

    <NuxtPage v-if="isAppInitialized" />

    <LnbToastStack />
  </div>
</template>

<style scoped>
/* LOADER */
.loader-overlay{position:fixed;inset:0;background:var(--bg);z-index:999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;transition:opacity 0.35s,visibility 0.35s}
.loader-overlay.hidden{opacity:0;visibility:hidden;pointer-events:none}
.loader-logo{font-size:24px;font-weight:800;letter-spacing:-0.5px;color:var(--accent)}
.loader-logo span{color:var(--text2);font-weight:400}
.loader-bar{width:160px;height:3px;background:var(--surface3);border-radius:2px;overflow:hidden}
.loader-bar-fill{height:100%;border-radius:2px;background:var(--accent);animation:loader-progress 1.4s cubic-bezier(0.4,0,0.2,1) forwards}
@keyframes loader-progress{0%{width:0%;opacity:1}70%{width:85%;opacity:1}100%{width:100%;opacity:0}}
.loader-text{font-size:12px;color:var(--text3);font-family:'JetBrains Mono',monospace;animation:loader-blink 1.2s ease-in-out infinite}
@keyframes loader-blink{0%,100%{opacity:0.4}50%{opacity:1}}
</style>