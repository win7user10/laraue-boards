<template>
  <section
    v-if="state.type !== 'ready'"
    class="page-state">
    <template v-if="state.type === 'pending'">
      <span class="icon-badge loading">
        <Loader />
      </span>
      <p>{{ loadingText }}</p>
    </template>
    <template v-else>
      <span class="icon-badge error">
        <AlertTriangle />
      </span>
      <h2>{{ errorTitle }}</h2>
      <p class="muted">{{ state.message }}</p>
      <button
        v-if="onRetry"
        class="secondary"
        type="button"
        @click="onRetry">
        {{ retryText }}
      </button>
      <slot
        :error="state.error"
        name="error-actions" />
    </template>
  </section>
  <slot
    v-else
    :data="state.data" />
</template>

<script setup lang="ts" generic="Value, Failure">
import { AlertTriangle, Loader } from 'lucide-vue-next'

import type { AsyncResultState } from '~/utils/asyncResultState'

withDefaults(
  defineProps<{
    errorTitle?: string
    loadingText?: string
    onRetry?: () => Promise<void> | void
    retryText?: string
    state: AsyncResultState<Value, Failure>
  }>(),
  {
    errorTitle: 'Could not load page',
    loadingText: 'Loading…',
    retryText: 'Try again',
  },
)

defineSlots<{
  'error-actions'?(props: { error: Failure }): unknown
  default(props: { data: Value }): unknown
}>()
</script>

<style scoped>
.page-state {
  display: grid;
  gap: var(--space-3);
  justify-items: center;
  padding: var(--space-6);
  text-align: center;
}

.page-state h2,
.page-state p {
  margin: 0;
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
