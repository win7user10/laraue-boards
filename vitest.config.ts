import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '#infrastructure': fileURLToPath(
        new URL('./infrastructure', import.meta.url),
      ),
      '~': fileURLToPath(new URL('./app', import.meta.url)),
    },
  },
})
