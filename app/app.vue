<script setup lang="ts">

import {useAppState} from "~/composables/appState";
import {onMounted} from "vue";
import WebApp from "@twa-dev/sdk";

const { appState } = useAppState();
const { setLocale, locales } = useI18n();

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

    <NuxtPage v-if="isAppInitialized" />

    <LnbToastStack />
  </div>
</template>

<style scoped>
</style>