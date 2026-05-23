<script setup lang="ts">

  const widgetContainer = ref<HTMLElement | null>(null);

  const { setIsAppInitialized, appState } = useAppState();
  const { setLocale, locales, t } = useI18n();
  const { initUserWithBearer } = useAuth();
  const configuration = useRuntimeConfig();
  const botName = configuration.public.botName;

  (window as any).onTelegramAuth = async (user: any) => {
    try {
      setIsAppInitialized(false);
      const { authViaWebApp } = useTelegramUserApi()
      const bearer = await authViaWebApp(user)
      await initUserWithBearer(bearer)
    } finally {
      setIsAppInitialized(true);
    }
  };

  onMounted(async () => {
    if (appState.value.isInMiniApp)
      navigateTo('/organizations')

    await trySetLocale();
    tryAddLoginWidget();
  });

  const tryAddLoginWidget = () => {
    if (!widgetContainer.value) return;

    // Create the script tag manually and append it AFTER the container exists
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', botName);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-radius', '10');
    script.setAttribute('data-userpic', 'true');

    // Telegram widget reads data attributes from the script tag itself,
    // not from a separate div — the script tag IS the widget
    widgetContainer.value.appendChild(script);
  }

  const trySetLocale = async () => {
    const browserLang = navigator.language.slice(0, 2);
    if (locales.value.find(l => l.code == browserLang))
      await setLocale(browserLang as any);
  }
</script>

<template>
  <LnbAuthScreen v-if="!appState.isInMiniApp">
    <div class="login-card">
      <div class="login-logo">msg<span>board</span></div>
      <div class="login-tagline">
        {{ t('turnMessages') }}<br> {{ t('intoBoard') }}
      </div>
      <div class="login-divider"></div>
      <div class="login-hint">{{ t('signIn') }}</div>
      <div ref="widgetContainer" class="login-widget"></div>
      <div class="login-footer">
        {{ t('dataStaysTelegram') }}<br> {{ t('noSeparateAccount') }}
      </div>
    </div>
  </LnbAuthScreen>
</template>

<style scoped>
.login-card {
  padding: 32px 24px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-logo {
  font-family: 'Syne', sans-serif;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: var(--accent);
  margin-bottom: 10px;
}

.login-logo span {
  color: var(--text2);
  font-weight: 400;
}

.login-tagline {
  font-family: 'Syne', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--text2);
  text-align: center;
  line-height: 1.5;
  margin-bottom: 24px;
}

.login-divider {
  width: 100%;
  height: 1px;
  background: var(--border);
  margin-bottom: 20px;
}

.login-hint {
  font-family: 'Syne', sans-serif;
  font-size: 11px;
  font-weight: 700;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 14px;
}

.login-widget {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  /* The Telegram iframe renders a light button — we can't restyle it,
     but we can ensure it sits centered on our dark background */
  min-height: 48px;
}

.login-footer {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--text3);
  text-align: center;
  line-height: 1.6;
}
</style>