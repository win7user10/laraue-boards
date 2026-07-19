<template>
  <main class="error-page">
    <section class="error-card">
      <div class="logo">
        <img
          alt=""
          class="logo-mark"
          src="/favicon.svg" />
        <span>Laraue Boards</span>
      </div>
      <span class="error-icon"><AlertTriangle /></span>
      <span class="error-code">{{ code }}</span>
      <h1>{{ title }}</h1>
      <p>{{ message }}</p>
      <div class="error-actions">
        <slot />
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'

defineProps<{ code: string; message: string; title: string }>()
</script>

<style scoped>
.error-page {
  display: grid;
  min-height: 100vh;
  padding: var(--space-6);
  place-items: center;
}

.error-card {
  align-items: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-dialog);
  box-shadow: var(--shadow-popover);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: clamp(28px, 6vw, 56px);
  text-align: center;
  width: min(580px, 100%);
}

.error-card .logo {
  align-self: flex-start;
  margin-bottom: var(--space-6);
}

.error-icon {
  background: color-mix(in srgb, var(--color-danger) 12%, transparent);
  border-radius: var(--radius-card);
  color: var(--color-danger);
  display: grid;
  height: 72px;
  place-items: center;
  width: 72px;
}

.error-icon svg {
  height: 34px;
  width: 34px;
}

.error-code {
  color: var(--color-danger);
  font-weight: var(--font-weight-semibold);
}

.error-card h1 {
  font-size: clamp(28px, 6vw, 40px);
  letter-spacing: -0.03em;
  margin: 0;
}

.error-card p {
  color: var(--color-muted);
  line-height: 1.6;
  max-width: 380px;
}

.error-actions {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-3);
}

@media (max-width: 480px) {
  .error-card .logo {
    align-self: center;
  }

  .error-actions {
    flex-direction: column;
    width: 100%;
  }
}
</style>
