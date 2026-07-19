<template>
  <section class="page-load-state">
    <template v-if="loading">
      <span class="icon-badge loading">
        <Loader />
      </span>
      <p>{{ loadingText }}</p>
    </template>
    <template v-else>
      <span class="icon-badge error">
        <AlertTriangle />
      </span>
      <p class="muted">{{ errorText }}</p>
      <button
        class="secondary"
        type="button"
        @click="$emit('retry')">
        {{ retryText }}
      </button>
    </template>
  </section>
</template>

<script setup lang="ts">
import { AlertTriangle, Loader } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    errorText: string
    loading: boolean
    loadingText: string
    retryText?: string
  }>(),
  { retryText: 'Try again' },
)

defineEmits<{ retry: [] }>()
</script>

<style scoped>
.page-load-state {
  display: grid;
  gap: var(--space-3);
  justify-items: center;
  min-height: 100dvh;
  padding: var(--space-6);
  place-content: center;
  text-align: center;
}

.icon-badge {
  border-radius: var(--radius-card);
  display: grid;
  height: 56px;
  place-items: center;
  width: 56px;
}

.icon-badge svg {
  height: 28px;
  width: 28px;
}

.icon-badge.loading {
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

.icon-badge.loading svg {
  animation: var(--animation-spin);
}

.icon-badge.error {
  background: color-mix(in srgb, var(--color-danger) 12%, transparent);
  color: var(--color-danger);
}
</style>
