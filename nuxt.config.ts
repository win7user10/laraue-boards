// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      meta: [
        {
          content: 'width=device-width, initial-scale=1, maximum-scale=1',
          name: 'viewport',
        },
      ],
      script: [
        { src: 'https://telegram.org/js/telegram-web-app.js?61' },
        {
          innerHTML: `const theme=localStorage.getItem('theme');if(theme)document.documentElement.dataset.theme=theme`,
        },
      ],
    },
  },

  compatibilityDate: '2025-07-15',
  css: ['~/assets/css/tokens.css', '~/assets/css/main.css'],
  devtools: { enabled: true },
  gtag: {
    enabled: process.env.NODE_ENV === 'production',
    id: 'G-RGM3JHLBGL'
  },

  experimental: {
    typedPages: true,
  },

  runtimeConfig: {
    public: {
      boardsApiBaseUrl: 'http://localhost:5200',
      botName: 'msgboard_bot',
      testUserToken: '',
    },
  },

  modules: ['nuxt-gtag'],
})